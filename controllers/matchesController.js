const User = require("../models/user");
const Candidate = require("../models/candidate");
const Job = require("../models/job_offer");
const { Client } = require('elasticsearch');
const client = new Client({ node: 'http://localhost:9200' });
module.exports = {
    getAllMatches: (req, res) => {
        res.render("matches/candidates/index");
    },

    getCandidateMatch: (req, res) => {
        res.render("matches/candidates/show");
    },

    getJobMatch: (req, res) => {
        res.render("matches/jobs/show");
    },
    getMatches: (req, res, next) => {
        let userId = req.params.id;
    
        User.findById(userId).then(user => {
          Candidate.findById(user.candidateProfile).then(candidate => {
            let query = {
              index: 'job_offers',
              body: {
                size: 20,
                query: {
                  "bool": {
                    "must": [
                      { "match": { "job_title": candidate.preferred_position } }
                    ],
                    // TODO: add the new fields of the models here and sort by importance
                  }
                }
              }
            }
    
            let hits;
            client.search(query, (err, result) => {
              if (err) { console.log(err) }
              hits = result.hits.hits

              for(let i = 0;i< hits.length;i++){
                hits[i]._source.shortDescription = hits[i]._source.description.substring(0,250) + "...";
              }

              res.locals.matches = hits;
              
              next()
            });
          });
        });
      },
}