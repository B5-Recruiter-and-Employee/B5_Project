const { Client } = require('elasticsearch');
const bonsai = process.env.BONSAI_URL || "http://localhost:9200";


const client = new Client({ node: bonsai });
const { respondWithMatches } = require('./matchesController');

module.exports = {
  renderSearch: (req, res) => {
    res.render("search/search", {
      matches: res.locals.matches,
      job_title: res.locals.job_title,
      size: res.locals.size,
      job_type: res.locals.job_type,
      remote: res.locals.remote,
      missingJobTitle: req.query.job_title
    });
  },

  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },

  getJobSearchResult: (req, res, next) => {

    if (req.query.job_title) {
      // define elasticsearch query
      res.locals.job_title = req.query.job_title;

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

      if (req.query.results) {
        query.body.size = req.query.results;
        res.locals.size = req.query.results;
      }

      if (req.query.remote) {
        let remote = { "match": { "location": req.query.remote } };
        query.body.query.bool.must.push(remote);
        res.locals.remote = req.query.remote;
      }

      if (req.query.job_type) {
        let job_type = [];
        if (Array.isArray(req.query.job_type)) {
          job_type = req.query.job_type;
        } else {
          job_type = [req.query.job_type];
        }
        
        let job_type_query = {
          "bool": {
            "should": [],
            "minimum_should_match": 1
          }
        }

        for (let i = 0; i < job_type.length; i++) {
          let job_type_match = { "match": { "job_type": job_type[i] } };
          job_type_query.bool.should.push(job_type_match);
        }
        query.body.query.bool.must.push(job_type_query);
        res.locals.job_type = req.query.job_type;
      }

      // send results as "matches" array to ejs
      respondWithMatches(req, res, next, query);
    } else {
      next();
    }
  }
}