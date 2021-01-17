const User = require("../models/user");
const {
  roles
} = require('../roles');
const Candidate = require("../models/candidate");
const Job = require("../models/job_offer");
const { Client } = require('elasticsearch');
const client = new Client({ node: 'http://localhost:9200' });

module.exports = {
  renderSearch: (req, res) => {
    res.render("search/search", {matches : res.locals.matches});
  },

  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },

  getJobSearchResult: (req, res, next) => {
    
    if (req.query.job_title || req.query.remote || req.query.job_type){
    // define elasticsearch query

    let query = {
      index: 'job_offers',
      body: {
        size: 10000,
        query: {
          "bool": {
            "must": [
              {
                "match": { "job_title": req.query.job_title }
              }
            ]
          }
        }
      }
    }
    if(req.query.results){
      query.body.size = req.query.results;
    }
    if (req.query.remote){
      let remote = { "match": {"location": req.query.remote }};
      query.body.query.bool.must.push(remote);
    }

    if(req.query.job_type){
      let job_type = [];
      if(Array.isArray(req.query.job_type)){
        job_type = req.query.job_type;
      }else{
        job_type = [req.query.job_type];
      }
      let job_type_query = {
        "bool": {
          "should": [],
          "minimum_should_match": 1
        }
      }
      for(let i = 0; i < job_type.length; i++){
        let job_type_match = { "match": {"job_type": job_type[i]}};
        job_type_query.bool.should.push(job_type_match);
      }
      query.body.query.bool.must.push(job_type_query);
    }

    let hits;
    client.search(query, (err, result) => {
      if (err) {
        console.log(err)
      }
      hits = result.hits.hits;

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
  } else{next();}
  }
}