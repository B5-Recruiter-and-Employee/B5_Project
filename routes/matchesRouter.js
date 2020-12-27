const candidatesController = require('../controllers/candidatesController');
const jobsController = require('../controllers/jobController');
const matchesController = require('../controllers/matchesController');
const userController = require('../controllers/userController');
var router = require('express').Router();

router.get("/matches/:id", matchesController.getMatches, matchesController.renderAllMatches);

module.exports = router;