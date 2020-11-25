const candidatesController = require('../controllers/candidatesController');
var router = require('express').Router();

//the overview of all candidates
router.get("/candidates", candidatesController.getAllCandidates);

//when contact form is submitted, the candidate is added to db
router.get("/candidates/new", candidatesController.getSubscriptionPage);

router.post("/candidates/create", candidatesController.saveCandidate);

module.exports = router;