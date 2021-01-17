const User = require("../models/user");
const Candidate = require("../models/candidate");
const Job = require("../models/job_offer");
const { Client } = require('elasticsearch');
const client = new Client({ node: 'http://localhost:9200' });
const { indexViewJobOffers } = require("./userController");

module.exports = {
  renderAllMatches: (req, res) => {
    if (typeof res.locals.matches != 'undefined') {
      res.render("matches/index");
    } else if (typeof res.locals.jobs != 'undefined') {
      res.render("jobs/index");
    }
  },

  renderSingleJobMatch: (req, res) => {
    res.render("matches/index");
  },

  getMatches: (req, res, next) => {
    let userId = req.params.id;

    User.findById(userId).then(user => {
      if (user.role === "recruiter") {
        Job.find({}).then(jobs => {
          res.locals.jobs = jobs.filter(offer => {
            let userAdded = user.jobOffers.some(userOffer => {
              return JSON.stringify(userOffer) === JSON.stringify(offer._id);
            });
            if (userAdded) return offer;
          });
          next();
        });
      } else {
        Candidate.findById(user.candidateProfile).then(candidate => {
          // sort the keywords by importance
          let sortedHardSkills = getSortedKeywords("hard_skills.name", candidate.hard_skills);
          let sortedWorkCulture = getSortedKeywords("work_culture_preferences.name", candidate.work_culture_preferences);

          // define elasticsearch query
          let searchedJobTitle = { "job_title": candidate.preferred_position }
          let query = getQuery('job_offers', searchedJobTitle, [sortedHardSkills, sortedWorkCulture]);
          let hits;
          client.search(query, (err, result) => {
            if (err) { console.log(err) }
            hits = result.hits.hits
            // add "shortDescription" to the hits array
            for (let i = 0; i < hits.length; i++) {
              hits[i]._source.shortDescription = getShortDescription(hits[i]._source.description);
            }
            // send hits array to ejs
            res.locals.matches = hits;
            next();
          });
        })
          .catch((error) => {
            next(error);
          });
      }
    })
      .catch((error) => {
        next(error);
      });
  },

  getSingleJobMatch: (req, res, next) => {
    let jobId = req.params.jobId;

    Job.findById(jobId).then(job => {
      // sort the keywords by importance
      let sortedHardSkills = getSortedKeywords("hard_skills.name", job.hard_skills);
      let sortedSoftSkills = getSortedKeywords("soft_skills.name", job.soft_skills);

      // define elasticsearch query
      let searchedJobTitle = { "preferred_position": job.job_title }
      let query = getQuery('candidates', searchedJobTitle, [sortedHardSkills, sortedSoftSkills]);
      let hits;
      client.search(query, (err, result) => {
        if (err) { console.log(err) }
        hits = result.hits.hits
        // add "shortDescription" to the hits array
        hits.forEach(h => {
          h._source.shortDescription = getShortDescription(h._source.description);
        });
        // send hits array to ejs
        res.locals.matches = hits;
        res.locals.user = req.app.locals.user;
        next();
      });
    });
  }
}

// *** Other functions *** //

/**
 * Define the elasticsearch query
 *
 * @param {String} index Defines in which collection (or index) the matches should be found.
 * @param {String} jobTitle The name of the job title to be filtered.
 * @param {Array} keywords Array of the match-objects for the keywords.
 * @return The completed query with soft skills and hard skills for particular index (or collection).
 */
let getQuery = (index, jobTitle, keywords) => {
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
}

let getShortDescription = (description) => {
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


/**
 * Helper function to sort the keywords by importance.
 * 
 * @param {String} field The field where Elasticsearch has to search. E.g. "hard_skills.name"
 * @param {Array} keywords The array of keywords with importance.
 */
let getSortedKeywords = function (field, keywords) {
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

  let should = [{
    "match": {
      [field]: {
        "query": importance3,
        "boost": 3
      }
    }
  }, {
    "match": {
      [field]: {
        "query": importance2,
        "boost": 2
      }
    }
  },
  {
    "match": {
      [field]: importance1
    }
  }]

  return should;
}