const candidatesController = require('../controllers/candidatesController');
const userController = require('../controllers/userController');
var router = require('express').Router();

router.get("/user/login", userController.login);
router.post("/user/login", userController.authenticate);
router.get("/user/logout", userController.logout, userController.redirectView);
// router.post("/user/login", userController.login)
router.get("/user/signup", userController.signup);
router.post("/user/signup", userController.createAccount, userController.redirectView);
router.get("/user/:id", userController.show, userController.showView);  
router.get("/user/:id/edit", userController.edit);
router.post("/user/:id/update", userController.update, userController.redirectView);
router.get("/user/:id/delete", userController.delete, userController.redirectView);

router.get("/user/:id/create_candidate", userController.newCandidateView);
router.post("/user/:id/add", userController.add, userController.redirectView);

router.get("/user/:id/create_offers", userController.newJobOffer);
router.get("/user/:id/offers", userController.indexJobOffers, userController.indexViewJobOffers);
router.post("/user/:id/add_job", userController.addJobOffers, userController.redirectView);
module.exports = router;
