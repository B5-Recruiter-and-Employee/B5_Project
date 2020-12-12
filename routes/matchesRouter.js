const candidatesController = require('../controllers/candidatesController');
const jobsController = require('../controllers/jobController');
const matchesController = require('../controllers/matchesController');
const userController = require('../controllers/userController');
var router = require('express').Router();

//routes for matches
router.get("/matches", matchesController.getAllMatches);
router.get("/matches/show", matchesController.getMatch);
module.exports = router;