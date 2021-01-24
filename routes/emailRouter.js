const emailController = require('../controllers/emailController');
var router = require('express').Router();

router.post("/apply/:id", emailController.sendMail);

module.exports = router;