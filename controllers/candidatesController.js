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

    //CREATE
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
        console.log('a candidate saved into both MongoDB and Elasticsearch')
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
    },
  edit: (req,res,next) => {

    let candidateId = req.params.id;
    Candidate.findById(candidateId).then(candidate => {
      res.render("candidates/edit",
      {
        candidate: candidate
      });
    })
      .catch(error => {
        console.log(`Error fetching user by ID: ${error.message}`);
        next(error);
      });
  },
  //UPDATE (WORKS)
  update: (req,res,next) => {
    let candidateId = req.params.id;

    let candidateParams = {
      preferred_position: req.body.preferred_position,
      soft_skills: req.body.soft_skills,
      other_aspects: req.body.other_aspects,
      work_culture_preferences: req.body.work_culture_preferences,
    };
    //has to be findOneAndUpdate bc it works with mongoosastic
    Candidate.findOneAndUpdate({_id: candidateId},
      {$set: candidateParams},
      {new: true})
    .then(candidate => {
      res.locals.redirect = `/candidates/${candidateId}`;
      res.locals.candidate = candidate;
      next();
      })
      .catch(error => {
        console.log(`Error updating candidate by ID: ${error.message}`);
        next(error);
      });
  },

  //DELETE (WORKS)
  delete: (req, res, next) => {
    let candidateId = req.params.id;
    Candidate.findByIdAndRemove(candidateId)
    .then(() => {
      res.locals.redirect = "/candidates";
      next();
    })
    .catch(error => {
      console.log(`Error deleting candidate by ID: ${error.message}`);
      next();
    })
  }

    //TODO Edit, Update, Delete
}
