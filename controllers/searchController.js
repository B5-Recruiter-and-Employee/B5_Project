const { Client } = require('elasticsearch');
const client = new Client({ node: 'http://localhost:9200' });
const errorController = require('./errorController');
const Candidate = require('../models/candidate');
const Job = require('../models/job_offer');
const matchesController = require('./matchesController');

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

    if (typeof req.app.locals.user === "undefined") {
      let redirect = `/search`;
      errorController.respondNotLoggedin(req, res, redirect);
    }

    if (req.app.locals.user.role !== 'candidate') {
      errorController.respondAccessDenied(req, res);
    }

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

      Candidate.findById(res.locals.user.candidateProfile).then(candidate => {
        // send results as "matches" array to ejs
        client.search(query, async (err, result) => {
          if (err) {
            console.error(`Error when trying to find matches for profile: ${candidate._id}\n`, err);
            errorController.respondInternalError(req, res);
          }
          let hits = result.hits.hits;
          let results = [];
          let promise = hits.map(async (hit) => {
            let mongoDoc;
            try {
              mongoDoc = await Job.findById(hit._id);
            } catch (error) {
              mongoDoc = null;
            }

            // only show this hit if it's also a document in MongoDB
            if (mongoDoc !== null) {
              mongoDoc.shortDescription = (typeof mongoDoc.description !== "undefined") ? matchesController.getShortDescription(mongoDoc.description) : "";
              results.push(mongoDoc);
            }
          });
          await Promise.all(promise);
          res.locals.matches = results;
          res.locals.onSearch = true;
          next();
        });
      })
        .catch((error) => {
          errorController.respondInternalError(req, res); //TO DO: print error
        });

    } else {
      next();
    }
  }
}