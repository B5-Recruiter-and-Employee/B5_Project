const candidatesController = require('../controllers/candidatesController');
const userController = require('../controllers/userController');
var router = require('express').Router();

//login and authentification
router.get("/user/login", userController.login);
router.post("/user/login", userController.authenticate);
router.get("/user/logout", userController.logout, userController.redirectView);
router.get("/thanks", userController.showThank)

//sign up links candidate
router.get("/signup/candidate", userController.newCandidateView);
router.post("/user/:id/add", userController.add, userController.redirectView);

//sign up links recruiter
router.get("/signup/recruiter", userController.newJobOffer); // render questionnaire
router.post("/signup/recruiter", userController.addJobOffers, userController.redirectView); // handle data
router.get("/user/signup/:jobId", userController.signup); // render signup page
router.post("/user/signup/:jobId", userController.signUpRecruiter, userController.redirectView);

//views for user and user's personal data
router.get("/user/:id", userController.show, userController.showView);  

router.get("/user/:id/edit", userController.edit);
router.post("/user/:id/update", userController.update, userController.redirectView);
//router.get("/user/:id/delete", userController.delete, userController.redirectView); - user does not have to have the option to delete its account.

//for recruiter user.
router.get("/user/:id/create_offers", userController.newJobOffer);
router.get("/user/:id/offers", userController.indexJobOffers, userController.indexViewJobOffers);
router.post("/user/:id/add_job", userController.addJobOffers, userController.redirectView);

module.exports = router;
