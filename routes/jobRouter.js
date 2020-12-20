const jobController = require('../controllers/jobController');
var router = require('express').Router();

//overview of job offers & form for creating jobs
// router.get("/jobs", jobController.getAllJobs);
// router.get("/jobs/new", jobController.createJobs); 
// router.post("/jobs/create", jobController.saveJob);

router.post("/jobs/:jobId/update", jobController.updateJob)

router.get("/jobs/:jobId/delete", jobController.deleteJob);

// edit form
router.get('/jobs/:jobId/edit', jobController.renderSingleJobEdit);

// render single job
router.get("/jobs/:jobId", jobController.getSingleJob, jobController.renderJobMatch);

module.exports = router;