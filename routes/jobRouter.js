const jobController = require('../controllers/jobController');
var router = require('express').Router();

//overview of job offers & form for creating jobs
router.get("/jobs", jobController.getAllJobs);

router.get("/jobs/new", jobController.createJobs); 

router.post("/jobs/create", jobController.saveJob);

module.exports = router;