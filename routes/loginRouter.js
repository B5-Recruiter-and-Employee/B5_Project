const userController = require('../controllers/userController');
var router = require('express').Router();

router.get("/login", userController.getLoginPage);

module.exports = router;