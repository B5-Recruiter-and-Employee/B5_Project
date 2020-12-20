const candidatesController = require('../controllers/candidatesController');
const jobsController = require('../controllers/jobController');
const matchesController = require('../controllers/matchesController');
const userController = require('../controllers/userController');
var router = require('express').Router();

// Routes for matches.
// This is just an example for FE to work.

router.get("/matches", matchesController.getAllMatches);
router.get("/matches/candidate", matchesController.getCandidateMatch);
router.get("/matches/job", matchesController.getJobMatch);
module.exports = router;