const Candidate = require("../models/candidate");
const User = require("../models/user");
const Job = require("../models/job_offer");
const userController = require("./userController");
const errorController = require("./errorController");

module.exports = {

	renderSingleCandidate: (req, res) => {
		let candidateId = req.params.candidateId;
		let user = req.app.locals.user;
		let jobs;
		if (user.role === 'recruiter') {
			Job.find({ _id: { $in: user.jobOffers } }).then(offers => {
				jobs = offers.map(offer => {
					if (JSON.stringify(offer.user) === JSON.stringify(user._id)) {
						return offer;
					}
				});
			});
		}

		Candidate.findById(candidateId)
			.then((candidate) => {
				User.findById(candidate.user).then((cardOwner) => {
					res.render("candidates/showSingleCandidate", {
						card: candidate,
						cardOwner: { name: cardOwner.fullName, email: cardOwner.email },
						// current logged in user
						user: user,
						jobs: jobs
					});
				});
			})
			.catch((error) => { //new error handling
				console.error(`Error while trying to find the user with id ${candidateId}`, error);
				errorController.respondInternalError(req, res);
			});
	},

	edit: (req, res, next) => {
		let candidateId = req.params.id;

		if (typeof req.app.locals.user === 'undefined') {
			let redirect = `/user/${candidateId}/edit`;
			errorController.respondNotLoggedin(req, res, redirect);
		  }

		  if (req.app.locals.user.candidateProfile != candidateId) {
			errorController.respondAccessDenied(req, res);
		  }

		Candidate.findById(candidateId).then((candidate) => {
			console.log("you are in the edit candidate page")
				res.render("candidates/edit", {
					candidate: candidate,
				});
			})
			.catch((error) => {
				console.error(`Error fetching user by ID: ${candidateId}`, error);
				errorController.respondInternalError(req, res);
			});
	},

	update: async (req, res, next) => {
		let candidateId = req.params.id;
		let candidateParams = userController.getCandidateParams(req, res);

		if (typeof req.app.locals.user === 'undefined') {
			let redirect = `/user/${candidateId}/edit`;
			errorController.respondNotLoggedin(req, res, redirect);
		  }

		if (req.app.locals.user.candidateProfile != candidateId) {
			errorController.respondAccessDenied(req, res);
		}

		try {
			candidateParams.max_score = await userController.getMaxScore("candidate", candidateParams);

			await Candidate.findOneAndUpdate(
				{ _id: candidateId },
				{ $set: candidateParams },
				{ new: true });
			req.flash("success", `Your preferences have been successfully updated!`);
			res.redirect(`/user/${req.app.locals.user._id}`);
			next();
		} catch (error) {
			req.flash(
				"error",
				`There has been an error while updating the candidate data: ${error.message}`
			);
			console.error(`Error updating user by ID: ${candidateId}`, error);
			errorController.respondInternalError(req, res);
		}
	},

	//candidate doesn't have the possibility to delete their profile yet
	// delete: (req, res, next) => {
	//   let candidateId = req.params.id;
	//     Candidate.findById(candidateId, function (err, candidate){
	//       candidate.remove(function (err, job){
	//         if(err) {
	//           console.log(err)
	//         } else {
	//           req.flash('success', `The candidate data has been successfully deleted!`);
	//           res.redirect(`/user/${user._id}`);
	//           console.log('candidate deleted from MongoDB and Elasticsearch');
	//         }
	//       })
	//     })
	//  },
};