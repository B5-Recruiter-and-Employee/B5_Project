const searchController = require('../controllers/searchController');
var router = require('express').Router();

//
router.get("/search", searchController.getJobSearchResult, searchController.renderSearch);
// router.post("/search/results", searchController.getJobSearchResult, searchController.redirectView);
module.exports = router;