const User = require("../models/user");
const Candidate = require("../models/candidate");
const Job = require("../models/job_offer");
const { Client } = require('elasticsearch');
const client = new Client({ node: 'http://elasticsearch:9200' });
const errorController = require("./errorController");

module.exports = {
  renderAllMatches: (req, res) => {
    res.render("matches/index");
  },

  getMatches: (req, res, next) => {
    let userId = req.params.id;

    User.findById(userId).then(user => {
      Candidate.findById(user.candidateProfile).then(candidate => {
        // sort the keywords by importance
        let sortedHardSkills = getSortedKeywords("hard_skills.name", candidate.hard_skills);
        let sortedSoftSkills = getSortedKeywords("soft_skills.name", candidate.soft_skills);

        // define elasticsearch query
        let query = {
          index: 'job_offers',
          body: {
            size: 20,
            query: {
              "bool": {
                "must": [
                  {
                    "match": {
                      "job_title": candidate.preferred_position
                    }
                  }
                ],
                "should": []
              }
            }
          }
        }

        // add "must" HARD SKILLS to query
        for (let i = 0; i < sortedHardSkills.must.length; i++) {
          query.body.query.bool.must.push(sortedHardSkills.must[i])
        }
        // add "should" HARD SKILLS to query
        for (let i = 0; i < sortedHardSkills.must.length; i++) {
          query.body.query.bool.should.push(sortedHardSkills.should[i])
        }

        // add "must" SOFT SKILLS to query
        for (let i = 0; i < sortedSoftSkills.must.length; i++) {
          query.body.query.bool.must.push(sortedSoftSkills.must[i])
        }
        // add "should" SOFT SKILLS to query
        for (let i = 0; i < sortedSoftSkills.must.length; i++) {
          query.body.query.bool.should.push(sortedSoftSkills.should[i])
        }

        let hits;
        client.search(query, (err, result) => {
          if (err) { console.log(err) }
          hits = result.hits.hits

          // add "shortDescription" to the hits array
          for (let i = 0; i < hits.length; i++) {
            let words = hits[i]._source.description.split(" ");
            if (words.length > 40) {
              let shortDesc = words.slice(0, 40);
              hits[i]._source.shortDescription = shortDesc.join(" ") + "...";
            } else {
              hits[i]._source.shortDescription = hits[i]._source.description;
            }
          }

          // send hits array to ejs
          res.locals.matches = hits;
          next();
        });
      })
        .catch((error) => {
          next(`MATCHES: No candidate profile was found for user "${userId}".`);
        });
    })
      .catch((error) => {
        next("MATCHES: User ID not found in database.");
      });
  }
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
  let importance4 = [];

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
      case 4:
        importance4.push(
          {
            "match": {
              "hard_skills.name": {
                "query": keyword.name,
                "boost": 3
              }
            }
          })
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

  return {
    should: should,
    must: importance4
  };
}