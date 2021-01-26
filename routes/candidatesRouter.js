const candidatesController = require('../controllers/candidatesController');
var router = require('express').Router();

// Edit the candidate's info.
router.get("/candidates/:id/edit", candidatesController.edit);
// Update the candidate's info.
router.post("/candidates/:id/update", candidatesController.update);
// Render single candidate profile.
router.get("/candidates/:candidateId", candidatesController.renderSingleCandidate);

module.exports = router;
