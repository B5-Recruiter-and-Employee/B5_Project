const homeController = require('../controllers/homeController');
const router = require('express').Router();

//create route to home page and log requests body
//(send data with a curl command, just for practice)
router.post("/", homeController.logRequestPaths);

//route to index page
router.get("/", homeController.getIndex);

module.exports = router;
