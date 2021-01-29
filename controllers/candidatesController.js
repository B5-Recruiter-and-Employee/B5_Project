const Candidate = require("../models/candidate");
const User = require("../models/user");
const Job = require("../models/job_offer");
const userController = require("./userController");
const errorController = require("./errorController");

module.exports = {

	renderSingleCandidate: async (req, res) => {
		let candidateId = req.params.candidateId;
		let user = req.app.locals.user;

		if (typeof req.app.locals.user === 'undefined') {
			let redirect = `/candidate/${candidateId}/`;
			errorController.respondNotLoggedin(req, res, redirect);
		}

		let jobs = [];
		if (user.role === 'recruiter') {
			try {
				let offers = await Job.find({ _id: { $in: user.jobOffers } });
				jobs = offers.map(offer => {
					if (JSON.stringify(offer.user) === JSON.stringify(user._id)) {
						return offer;
					}
				});
			} catch (error) {
				console.error(`Error while trying to get recruiter's jobs`, error);
				errorController.respondInternalError(req, res);
			}
		}

		try {
			let candidate = await Candidate.findById(candidateId);
			if (typeof candidate.user == "undefined") {
				res.render("candidates/showSingleCandidate", {
					card: candidate,
					cardOwner: { name: " ", email: " " },
					// current logged in user
					user: user,
					jobs: jobs
				});
			} else {
				let cardOwner = await User.findById(candidate.user);
				res.render("candidates/showSingleCandidate", {
					card: candidate,
					cardOwner: { name: cardOwner.fullName, email: cardOwner.email },
					// current logged in user
					user: user,
					jobs: jobs
				});
			};
		} catch (error) {
			console.error(`Error while trying to find the user with id ${candidateId}`, error);
			errorController.respondNotFound(req, res);
		};
	},

	edit: (req, res, next) => {
		let candidateId = req.params.id;

		if (typeof req.app.locals.user === 'undefined') {
			let redirect = `/candidates/${candidateId}/edit`;
			errorController.respondNotLoggedin(req, res, redirect);
		}

		if (req.app.locals.user.candidateProfile != candidateId) {
			errorController.respondAccessDenied(req, res);
		}

		Candidate.findById(candidateId).then((candidate) => {
			res.render("candidates/edit", {
				candidate: candidate,
			});
		})
			.catch((error) => {
				console.error(`Error fetching user by ID: ${candidateId}`, error);
				errorController.respondNotFound(req, res);
			});
	},

	update: async (req, res, next) => {
		let candidateId = req.params.id;
		let candidateParams = userController.getCandidateParams(req, res);

		if (typeof req.app.locals.user === 'undefined') {
			let redirect = `/candidates/${candidateId}/edit`;
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