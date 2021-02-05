const User = require("../models/user");
const Candidate = require("../models/candidate");
const Job = require("../models/job_offer");
const { Client } = require('elasticsearch');
const errorController = require("./errorController");
const bonsai = process.env.BONSAI_URL || "http://localhost:9200";
const client = new Client({ host: bonsai });

module.exports = {
  renderAllMatches: (req, res) => {
    if (typeof res.locals.matches != "undefined") {
      res.render("matches/index");
    } else if (typeof res.locals.jobs != "undefined") {
      res.render("jobs/index");
    }
  },

  renderSingleJobMatch: (req, res) => {
    res.render("matches/index", { jobId: req.params.jobId }); 
  },

  getMatches: (req, res, next) => {
    let userId = req.params.id; 

    if (typeof req.user === "undefined") {
      let redirect = `/matches/${userId}/`;
      errorController.respondNotLoggedin(req, res, redirect);
    }

    if (req.user._id != userId) {
      errorController.respondAccessDenied(req, res);
    }

    User.findById(userId).then(user => {
      if (user.role === "recruiter") {
        let currentUser = res.locals.user;
        Job.find({_id: {$in: currentUser.jobOffers}}).then(offers => {
          // just an extra check if userID in the job offer matches the current user's ID
          let mappedOffers = offers.filter(offer => { return JSON.stringify(offer.user) === JSON.stringify(currentUser._id) });
          res.locals.jobs = mappedOffers;
          next();
        }).catch(error => {
          console.error(`Error while indexing jobs for recruiter`, error)
          errorController.respondInternalError(req, res);
        });
      } else {
        Candidate.findById(user.candidateProfile).then(candidate => {
          // sort the keywords by importance
          let sortedHardSkills = module.exports.getSortedKeywords("hard_skills.name", candidate.hard_skills);
          let sortedWorkCulture = module.exports.getSortedKeywords("work_culture_keywords", candidate.work_culture_preferences);

          // define elasticsearch query
          let searchedJobTitle = { "job_title": candidate.preferred_position }
          let query = module.exports.getQuery('job_offers', searchedJobTitle, [sortedHardSkills, sortedWorkCulture]);

          // send results as "matches" array to ejs
          module.exports.respondWithMatches(req, res, next, query, candidate);
        })
          .catch((error) => {
            console.error(`Error while getting matches for candidate`, error)
            errorController.respondInternalError(req, res); 
          });
      }
    })
      .catch((error) => {
        console.error(`Error while trying to fetch matches`, error);
        errorController.respondInternalError(req, res); 
      });
  },

  getSingleJobMatch: (req, res, next) => {
    let jobId = req.params.jobId;

    if (typeof req.app.locals.user === "undefined") {
			let redirect = `/matches/jobs/${jobId}/`;
			errorController.respondNotLoggedin(req, res, redirect);
      }

    //if role not recruiter or job isn't in the job offers
    if (!(req.user.role = "recruiter" && req.user.jobOffers.includes(jobId))) {
      errorController.respondAccessDenied(req, res);
    }

    Job.findById(jobId).then(job => {
      // sort the keywords by importance
      let sortedHardSkills = module.exports.getSortedKeywords("hard_skills.name", job.hard_skills);
      let sortedSoftSkills = module.exports.getSortedKeywords("soft_skills", job.soft_skills);

      // define elasticsearch query
      let searchedJobTitle = { "preferred_position": job.job_title }
      let query = module.exports.getQuery('candidates', searchedJobTitle, [sortedHardSkills, sortedSoftSkills]);

      // send results as "matches" array to ejs
      module.exports.respondWithMatches(req, res, next, query, job);
    }).catch((error) => {
      console.error(`Error while trying to fetch matches`, error);
      errorController.respondNotFound(req, res); 
    });
  },

  calculateScore: (max_score, score) => {
    if (typeof max_score === "undefined" || max_score === 0) {
      max_score = -1;
    }
    let percentage = score / max_score * 100;
    return percentage;
  },

  respondWithMatches: (req, res, next, query, searcher) => {
    client.search(query, async (err, result) => {
      if (err) { 
        console.error(`Error when trying to find matches for profile: ${searcher._id}\n`, err);
				errorController.respondInternalError(req, res);
      }
      let hits = result.hits.hits;
      let results = [];
      let promise = hits.map(async (hit) => {
        let mongoDoc;
        // check if searcher is job or candidate
        if (typeof searcher.job_title === 'undefined') {
          try {
            mongoDoc = await Job.findById(hit._id);
          } catch (error) {
            mongoDoc = null;
          }
        } else {
          try {
            mongoDoc = await Candidate.findById(hit._id);
          } catch (error) {
            mongoDoc = null;
          }
        }

        // only show this hit if it's also a document in MongoDB
        if (mongoDoc !== null) {
          mongoDoc.compatibility = module.exports.calculateScore(searcher.max_score, hit._score);
          // add "shortDescription" and "compatibility" and filter bad ones
          if (mongoDoc.compatibility >= 10.0) {
            mongoDoc.shortDescription = (typeof mongoDoc.description !== "undefined") ? module.exports.getShortDescription(mongoDoc.description) : "";
            results.push(mongoDoc);
          }
        }
        
      });
      await Promise.all(promise);
      res.locals.matches = results.sort(function(a, b){return b.compatibility - a.compatibility});
      next();
    });
  },

  /**
   * Define the elasticsearch query
   *
   * @param {String} index Defines in which collection (or index) the matches should be found.
   * @param {String} jobTitle The name of the job title to be filtered.
   * @param {Array} keywords Array of the match-objects for the keywords.
   * @return The completed query with soft skills and hard skills for particular index (or collection).
   */
  getQuery: (index, jobTitle, keywords) => {
    let query = {
      index: index,
      body: {
        size: 20,
        query: {
          "bool": {
            "must": [
              {
                "match": jobTitle
              }
            ],
            "should": []
          }
        }
      }
    };
    let bool = query.body.query.bool;

    // add keywords
    keywords.forEach(matchObjects => {
      matchObjects.forEach(o => {
        bool.should.push(o)
      });
    });
    return query;
  },

  /**
   * Helper function to sort the keywords by importance.
   * 
   * @param {String} field The field where Elasticsearch has to search. E.g. "hard_skills.name"
   * @param {Array} keywords The array of keywords with importance.
   */
  getSortedKeywords: function (field, keywords) {
    let importance1 = "";
    let importance2 = "";
    let importance3 = "";
    //let importance4 = [];

    for (let i = 0; i < keywords.length; i++) {
      let keyword = keywords[i];
      switch (keyword.importance) {
        case 1:
          importance1 = importance1 + " " + keyword.name
          break;
        case 2:
          importance2 = importance2 + " " + keyword.name
          break;
        case 3:
          importance3 = importance3 + " " + keyword.name
          break;
        default:
          break;
      }
    }

    let should = [];
    if (importance3.length > 0) {
      should.push({
        "match": {
          [field]: {
            "query": importance3,
            "boost": 3
          }
        }
      });
    }
    if (importance2.length > 0) {
      should.push({
        "match": {
          [field]: {
            "query": importance2,
            "boost": 2
          }
        }
      });
    }
    if (importance1.length > 0) {
      should.push({
        "match": {
          [field]: importance1
        }
      });
    }

    return should;
  },

  getShortDescription: (description) => {
    let shortDescription;
    let words = description.split(" ");
    if (words.length > 40) {
      let shortDesc = words.slice(0, 40);
      shortDescription = shortDesc.join(" ") + "...";
    } else {
      shortDescription = description;
    }
    return shortDescription;
  }
}