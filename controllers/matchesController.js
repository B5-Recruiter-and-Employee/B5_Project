const User = require("../models/user");
const Candidate = require("../models/candidate");
const Job = require("../models/job_offer");
const { Client } = require('elasticsearch');
const client = new Client({ node: 'http://localhost:9200' });
const errorController = require("./errorController");
const { indexViewJobOffers } = require("./userController");

module.exports = {
  renderAllMatches: (req, res) => {
    res.render("matches/index");
  },

  getMatches: (req, res, next) => {
    let userId = req.params.id;

    User.findById(userId).then(user => {
      if (user.role === "recruiter") {
        Job.find({}).then(jobs => {
          console.log(jobs.length);

          //we have to check how it works when dummy data is created and then adapt the ejs files.
          let mappedOffers = jobs.filter(offer => {
            let userAdded = user.jobOffers.some(userOffer => {
              return JSON.stringify(userOffer) === JSON.stringify(offer._id);
            });
            if (userAdded) return offer;
          });
          console.log(mappedOffers.length);
          let structuredHits= [];
          // IF there are no jobs found for this user, then no matches can be offered.
          // IF there are jobs saved by recruiter, then find the matches.
          if (mappedOffers.length > 0) {
            mappedOffers.forEach(jobOfferOfRecruiter => {
              let sortedHardSkills = getSortedKeywords("hard_skills.name", jobOfferOfRecruiter.hard_skills);
              let sortedSoftSkills = getSortedKeywords("soft_skills.name", jobOfferOfRecruiter.soft_skills);
              // define elasticsearch query
              let searchedJobTitle = { "preferred_position": jobOfferOfRecruiter.job_title }
              let query = addSortedSkills('candidates', searchedJobTitle, sortedHardSkills, sortedSoftSkills);
              
              client.search(query, (err, result) => {
                if (err) { console.log(err) }
                let matches = result.hits.hits;
                //adapted for work experience. The array of sentences (each sentence is of String type) joined together in one
                // variable to represent a text. Each string is divided by the dot.
                //TO DO: change to description 
                for (let i = 0; i < matches.length; i++) {
                  let description = matches[i]._source.description;
                  matches[i]._source.shortDescription = description;
                }
                //TO DO: check without reverse and compare
                var sortedMatches = matches.sort(compare).reverse();
                structuredHits.push({
                    jobOffer : jobOfferOfRecruiter,
                    candidatesMatches : sortedMatches
                });
                console.log("job offer", jobOfferOfRecruiter);
                //render the matches page only if the last element of recruiter's offer reached
                if(mappedOffers.indexOf(jobOfferOfRecruiter) == (mappedOffers.length-1)) {
                  res.locals.matches = structuredHits; 
                  res.locals.user = user;
                  next();
                }
              })
            })
          } else {
            res.locals.matches = [];
            next();
          }
        })
          .catch((error) => {
            next(`MATCHES: No job offer was found for user "${userId}".`);
          });
      } else {
        Candidate.findById(user.candidateProfile).then(candidate => {
          // sort the keywords by importance
          let sortedHardSkills = getSortedKeywords("hard_skills.name", candidate.hard_skills);
          let sortedSoftSkills = getSortedKeywords("soft_skills.name", candidate.soft_skills);

          // define elasticsearch query
          let searchedJobTitle = { "job_title": candidate.preferred_position }
          let query = addSortedSkills('job_offers', searchedJobTitle, sortedHardSkills, sortedSoftSkills);
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
      }
    })
      .catch((error) => {
        next("MATCHES: User ID not found in database.");
      });
  }
}

// *** Other functions *** //
/**
 * Sorts an array based on particular value.
 * @param {Number} a The score of one element.
 * @param {Number} b The score of the next element.
 * @returns 0, if both equal.
 */
function compare(a, b) {
  if (a._score > b._score) return 1;
  if (b._score > a._score) return -1;

  return 0;
}

/**
 *
 * @param {String} index Defines in which collection (or index) the matches should be found.
 * @param {String} jobTitle The name of the job title to be filtered.
 * @param {Array} hardSkills Sorted array of hard skills to query.
 * @param {Array} softSkills Sorted array of soft skills to query.
 * @return The completed query with soft skills and hard skills for particular index (or collection).
 */
let addSortedSkills = (index, jobTitle, hardSkills, softSkills) => {
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
  // add "must" HARD SKILLS to query
  //for (let i = 0; i < hardSkills.must.length; i++) {
  //  bool.must.push(hardSkills.must[i])
  //}
  // add "should" HARD SKILLS to query
  for (let i = 0; i < hardSkills.length; i++) {
    bool.should.push(hardSkills.should[i])
  }

  // add "must" SOFT SKILLS to query
  //for (let i = 0; i < softSkills.must.length; i++) {
  //  bool.must.push(softSkills.must[i])
  //}
  // add "should" SOFT SKILLS to query
  for (let i = 0; i < softSkills.length; i++) {
    bool.should.push(softSkills.should[i])
  }
  console.log(query);
  return query;
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
      //case 4:
      //  importance4.push(
      //    {
      //      "match": {
      //        [field]: {
      //          "query": keyword.name,
      //          "boost": 4
      //        }
      //      }
      //    })
      //  break;
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
    //must: importance4
  };
}