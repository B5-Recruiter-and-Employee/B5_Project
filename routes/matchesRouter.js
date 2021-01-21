const candidatesController = require('../controllers/candidatesController');
const jobsController = require('../controllers/jobController');
const matchesController = require('../controllers/matchesController');
const userController = require('../controllers/userController');
var router = require('express').Router();

//overview of all matches.
router.get("/matches/:id", matchesController.getMatches, matchesController.renderAllMatches);

// for recruiter: matches for specific job offer
router.get("/matches/jobs/:jobId", matchesController.getSingleJobMatch, matchesController.renderSingleJobMatch);

module.exports = router;