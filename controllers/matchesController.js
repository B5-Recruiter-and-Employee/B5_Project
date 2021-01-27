const User = require("../models/user");
const Candidate = require("../models/candidate");
const Job = require("../models/job_offer");
const { Client } = require('elasticsearch');
const client = new Client({ node: 'http://localhost:9200' });
//errorcontroller require

module.exports = {
  renderAllMatches: (req, res) => {
    if (typeof res.locals.matches != 'undefined') {
      res.render("matches/index");
    } else if (typeof res.locals.jobs != 'undefined') {
      res.render("jobs/index");
    }
  },

  renderSingleJobMatch: (req, res) => {
    res.render("matches/index", { jobId: req.params.jobId }); 
  },

  getMatches: (req, res, next) => {
    let userId = req.params.id; //TO DO: check if logged in

    User.findById(userId).then(user => {
      if (user.role === "recruiter") {
        let currentUser = res.locals.user;
        Job.find({_id: {$in: currentUser.jobOffers}}).then(offers => {
          // just an extra check if userID in the job offer matches the current user's ID
          let mappedOffers = offers.filter(offer => { return JSON.stringify(offer.user) === JSON.stringify(currentUser._id) });
          res.locals.jobs = mappedOffers;
          next();
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
            errorController.respondInternalError(req, res); //TO DO: print error
          });
      }
    })
      .catch((error) => {
        errorController.respondInternalError(req, res); //TO DO: print error
      });
  },

  getSingleJobMatch: (req, res, next) => {
    let jobId = req.params.jobId;

    Job.findById(jobId).then(job => {
      // sort the keywords by importance
      let sortedHardSkills = module.exports.getSortedKeywords("hard_skills.name", job.hard_skills);
      let sortedSoftSkills = module.exports.getSortedKeywords("soft_skills", job.soft_skills);

      // define elasticsearch query
      let searchedJobTitle = { "preferred_position": job.job_title }
      let query = module.exports.getQuery('candidates', searchedJobTitle, [sortedHardSkills, sortedSoftSkills]);

      // send results as "matches" array to ejs
      module.exports.respondWithMatches(req, res, next, query, job);
    });
  },

  calculateScore: (max_score, score) => {
    if (typeof max_score === 'undefined' || max_score === 0) {
      max_score = -1;
    }
    let percentage = score / max_score * 100;
    let compatibility;
    switch (true) {
      case (percentage >= 60.0):
        compatibility = "Excellent";
        break;
      case (percentage < 60.0 && percentage >= 30.0):
        compatibility = "Great";
        break;
      case (percentage < 30.0 && percentage >= 10.0):
        compatibility = "Good";
        break;
      case (percentage < 10.0 && percentage >= 0):
        compatibility = "Bad";
        break;
      default:
        compatibility = "N/A";
        break;
    }
    return compatibility;
  },

  respondWithMatches: (req, res, next, query, searcher) => {
    client.search(query, (err, result) => {
      if (err) { 
        console.error(`Error when trying to find matches for user: ${searcher}`, err);
				errorController.respondInternalError(req, res);
      }
      let hits = result.hits.hits;
      // add "shortDescription" and "compatibility" and filter bad ones
      let results = hits.reduce((matches, h) => {
        h._source.compatibility = module.exports.calculateScore(searcher.max_score, h._score);
        if (h._source.compatibility !== 'Bad') {
          h._source.shortDescription = (typeof h._source.description !== 'undefined') ? module.exports.getShortDescription(h._source.description) : "";
          matches.push(h);
        }
        return matches;
      }, []);
      res.locals.matches = results;
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