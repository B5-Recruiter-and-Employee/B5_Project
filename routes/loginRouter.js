const userController = require('../controllers/userController');
var router = require('express').Router();

router.get("/user/login", userController.getLoginPage);

// router.post("/login",userController.getThanksPage);

module.exports = router;
