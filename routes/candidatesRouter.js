const candidatesController = require('../controllers/candidatesController');
var router = require('express').Router();

//the overview of all candidates
router.get("/candidates", candidatesController.index, candidatesController.indexView);

//form for creating candidate
router.get("/candidates/new", candidatesController.new);
//when submitting the form
router.post("/candidates/create", candidatesController.create, candidatesController.redirectView);
//get the view of one candidate
router.get("/candidates/:id", candidatesController.show, candidatesController.showView);
//TODO edit, update, delete

module.exports = router;