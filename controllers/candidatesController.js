const Candidate = require("../models/candidate");

module.exports = {
    index: (req, res, next) => {
        Candidate.find({})
            .exec()
            .then((candidates) => {
                res.locals.candidates = candidates;
                next();
            })
            .catch((error) => {
                console.log(`Error fetching candidates: ${error.message}`);
                return [];
            })
            .then(() => {
                console.log("promise complete");
            });
    },

    indexView: (req, res) => {
        res.render("candidates/index");
    },
    
    new: (req, res) => {
        res.render("candidates/new");
    },

    create: (req, res, next) => {
		let candidateParams = {
            preferred_position: req.body.preferred_position,
            soft_skills: req.body.soft_skills,
            other_aspects: req.body.other_aspects,
            work_culture_preferences: req.body.work_culture_preferences,
        }
		Candidate.create(candidateParams)
			.then(candidate => {
				res.locals.redirect = '/candidates';
				res.locals.candidate = candidate;
				next();
			})
			.catch(error => {
				console.log(`Error saving candidate profile: ${error.message}`);
				next(error);
			});
    },
    
    redirectView: (req, res, next) => {
        let redirectPath = res.locals.redirect;
        if (redirectPath) res.redirect(redirectPath);
        else next();
    },

	show: (req, res, next) => {
		let candidateId = req.params.id;
		Candidate.findById(candidateId).then(candidate => {
			res.locals.candidate = candidate;
			next();
		})
			.catch(error => {
				console.log(`Error fetching candidate by ID: ${error.message}`);
				next(error);
			});
	},
	
	showView: (req, res) => {
        res.render('candidates/show');
    }

    //TODO Edit, Update, Delete
}