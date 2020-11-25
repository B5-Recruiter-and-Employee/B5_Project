const errorController = require('../controllers/errorController');
const app = require('express')();
var router = require('express').Router();

app.use(errorController.respondNoResourceFound);
app.use(errorController.respondInternalError);

module.exports = router;