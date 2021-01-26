const errorController = require('../controllers/errorController');
var router = require('express').Router();

router.use(errorController.respondNotFound);

module.exports = router;