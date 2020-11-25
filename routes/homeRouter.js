const router = require('express').Router();
const homeController = require('../controllers/homeController');

//create route to home page and log requests body
//(send data with a curl command, just for practice)
router.post("/", homeController.logRequestPaths);

//route to index page
router.get("/", homeController.getIndex);

//route to a function that responds with your name as a route parameter
//(just for practice)
router.get("/name/:myName", homeController.respondWithName);








module.exports = router;