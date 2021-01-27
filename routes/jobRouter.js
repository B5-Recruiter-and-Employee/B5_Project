const jobController = require('../controllers/jobController');
var router = require('express').Router();

router.get("/user/:id/offers", jobController.indexJobOffers, jobController.renderJobOffers);

// single jobs CRUD
router.get("/jobs/:jobId", jobController.renderSingleJob);
router.get('/jobs/:jobId/edit', jobController.renderSingleJobEdit);
router.post("/jobs/:jobId/update", jobController.updateJob)
router.get("/jobs/:jobId/delete", jobController.deleteJob);

module.exports = router;
