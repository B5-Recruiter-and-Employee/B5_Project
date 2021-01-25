const errorController = require('../controllers/errorController');
var router = require('express').Router();

router.use(errorController.respondNotFound);
router.use(errorController.respondInternalError);

module.exports = router;