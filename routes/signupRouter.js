const userController = require('../controllers/userController');
var router = require('express').Router();

router.get("/user/signup", userController.getSignupPage);

module.exports = router;