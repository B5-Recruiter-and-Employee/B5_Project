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
    res.render("search/search");
  },

  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },

  getJobSearchResult: (req, res, next) => {
    
    // define elasticsearch query
    let query = {
      index: 'job_offers',
      body: {
        size: 10000,
        query: {
          "bool": {
            "must": [
              {
                "match": { "job_title": req.body.job_title }
              }
            ]
          }
        }
      }
    }

    if (req.body.remote){
      let remote = { "match": {"location": req.body.remote }};
      query.body.query.bool.must.push(remote);
    }

    let hits;
    client.search(query, (err, result) => {
      if (err) {
        console.log(err)
      }
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
      console.log(hits);
      // send hits array to ejs
      res.locals.matches = hits;

      res.locals.redirect = "/search";

      next();
    });
  }
}