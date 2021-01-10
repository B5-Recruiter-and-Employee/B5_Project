const searchController = require('../controllers/searchController');
var router = require('express').Router();

//
router.get("/search", searchController.renderSearch);

module.exports = router;