const userController = require('../controllers/userController');
var router = require('express').Router();
const passport = require('passport');
//login and authentification
router.get("/user/login", userController.renderLogin);
router.post("/user/login",  passport.authenticate('local'), userController.authPassport);
router.get("/user/logout", userController.logout, userController.redirectView);
router.get("/thanks", userController.renderThanks)

//sign up links candidate
router.get("/signup/candidate", userController.renderNewCandidate);
router.post("/signup/candidate", userController.addCandidate, userController.redirectView);
router.get("/score/:candidateId", userController.addCandidateMaxScore, userController.redirectView);
router.get("/signup/candidate/:candidateId", userController.renderCandidateSignUp);
router.post("/signup/candidate/:candidateId", userController.signUpCandidate, userController.redirectView);

//sign up links recruiter
router.get("/signup/recruiter", userController.renderNewJobOffer);
router.post("/signup/recruiter", userController.addJobOffers, userController.redirectView);
router.get("/signup/recruiter/:jobId", userController.renderRecruiterSignUp);
router.post("/signup/recruiter/:jobId", userController.signUpRecruiter, userController.redirectView);

//views for user and user's personal data
router.get("/user/:id", userController.renderView);
router.get("/user/:id/edit", userController.renderEdit);
router.post("/user/:id/update", userController.update, userController.redirectView);
//router.get("/user/:id/delete", userController.delete, userController.redirectView); - user does not have to have the option to delete its account.

//for recruiter user.
router.get("/user/:id/add-job", userController.renderNewJobOffer);
router.post("/user/:id/add-job", userController.addJobOffers, userController.redirectView);
router.get("/score/:jobId", userController.addJobMaxScore, userController.redirectView);

module.exports = router;
