const Candidate = require("../models/candidate");
const User = require("../models/user");
const userController = require("./userController");

module.exports = {

	renderSingleCandidate: (req, res) => {
		let cardId = req.params.candidateId;

		Candidate.findById(cardId)
			.then((candidate) => {
				User.find({ candidateProfile: candidate._id }).then((cardOwner) => {
					res.render("candidates/showSingleCandidate", {
						card: candidate,
						cardOwner: { name: cardOwner.fullName, email: cardOwner.email },
						// current logged in user
						user: res.locals.user,
					});
				});
			})
			.catch((error) => {
				console.log(error.message);
				return [];
			});
	},

	edit: (req, res, next) => {
		let candidateId = req.params.id;
		Candidate.findById(candidateId)
			.then((candidate) => {
				res.render("candidates/edit", {
					candidate: candidate,
				});
			})
			.catch((error) => {
				console.log(`Error fetching user by ID: ${error.message}`);
				next(error);
			});
	},

	update: async (req, res, next) => {
		let candidateId = req.params.id;
		let candidateParams = userController.getCandidateParams(req, res);

		try {
			candidateParams.max_score = await userController.getMaxScore("candidate", candidateParams);

			await Candidate.findOneAndUpdate(
				{ _id: candidateId },
				{ $set: candidateParams },
				{ new: true });
			req.flash("success", `The candidate has been successfully updated!`);
			res.redirect(`/user/${req.app.locals.user._id}`);
			console.log("candidate updated in MongoDB and Elasticsearch");
			next();
		} catch (error) {
			req.flash(
				"error",
				`There has been an error while updating the candidate data: ${error.message}`
			);
			console.log(`Error updating candidate by ID: ${error.message}`);
			next(error);
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