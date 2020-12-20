const User = require("../models/user");
const Candidate = require("../models/candidate");
const Job = require("../models/job_offer");
const { Client } = require('elasticsearch');
const client = new Client({ node: 'http://localhost:9200' });

module.exports = {
    getAllMatches: (req, res) => {
        res.render("matches/index");
    },

    getCandidateMatch: (req, res) => {
        res.render("matches/candidates/show");
    },

    getJobMatch: (req, res) => {
        res.render("matches/jobs/show");
    },

    getSingleMatch: (req, res, next) => {
        let cardId = req.params.cardId

        Job.findById(cardId).then(card => {
          res.locals.card = card;
          console.log(card)     
          next()
        })
    },

    getMatches: (req, res, next) => {
        let userId = req.params.id;
    
        User.findById(userId).then(user => {
          Candidate.findById(user.candidateProfile).then(candidate => {
          let hard_skills1 = "";
          let hard_skills2 = "";
          let hard_skills3 = "";
          let hard_skills4 = [];

            for(let i = 0; i < candidate.hard_skills.length; i++){
              let hardskill = candidate.hard_skills[i];
              console.log(hardskill.importance);
              switch(hardskill.importance){
                case 1:
                  hard_skills1 = hard_skills1 + " " +hardskill.name
                  break;
                case 2:
                  hard_skills2 = hard_skills2 + " " +hardskill.name
                  break;
                case 3:
                  hard_skills3 = hard_skills3 + " " +hardskill.name
                  break;
                case 4:
                  hard_skills4.push(
                    {"match":{
                    "hard_skills.name":{
                      "query":hardskill.name,
                      "boost":3
                    }
                    }})
                  break;
                default: 
                break;
              }
            }
            
            let query = {
              index: 'job_offers',
              body: {
                size: 20,
                query: {
                  "bool": {
                    "must": [ 
                      { "match": { 
                        "job_title": candidate.preferred_position }}
                    ],
                    "should":[{
                      "match":{
                      "hard_skills.name":{
                        "query":hard_skills3,
                        "boost":3
                      }
                      }
                    },{
                      "match":{
                      "hard_skills.name":{
                        "query":hard_skills2,
                        "boost":2
                      }
                      }
                      },
                      {
                      "match":{
                      "hard_skills.name":{
                        "query":hard_skills1,
                        "boost":1
                      }
                      }
                    }]
                    // TODO: add the new fields of the models here and sort by importance
                  }
                }
              }
            }
            for(let i = 0;i<hard_skills4.length;i++){
            query.body.query.bool.must.push(hard_skills4[i])}
            

    
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