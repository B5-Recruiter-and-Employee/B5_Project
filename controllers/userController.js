const passport = require('passport');
const User = require("../models/user");
const { roles } = require('../roles');
const Candidate = require("../models/candidate");
const { Client } = require('elasticsearch');
const Job = require("../models/job_offer");
const client = new Client({ node: 'http://localhost:9200' });

module.exports = {
  login: (req, res) => {
    res.render("user/login");

  },

  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    console.log(res.locals.loggedIn);
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },

  show: (req, res, next) => {
    let userId = req.params.id;
    User.findById(userId).then(user => {
      console.log(user);
      res.locals.user = user;
      res.locals.loggedIn = user;
      console.log('show: ', res.locals.loggedIn);
      Candidate.findById(user.candidateProfile).then(candidate => {
        res.locals.candidate = candidate;
        next();
      })

    })
      .catch(error => {
        console.log(`Error fetching user by ID: ${error.message}`);
        next(error);
      });
  },

  showView: (req, res) => {
    let userId = req.params.id;
    User.findById(userId).then(user => {
      if (user.candidateProfile) {
        Candidate.findById(user.candidateProfile).then(candidate => {
          User.findById(candidate.user).then(user => {
            res.render('user/profile', {
              card: candidate,
              cardOwner: {name: user.fullName, email: user.email}
            });
          })
        })
      } else {
        res.render('user/profile');
      }
    })
  },

  authenticate: passport.authenticate("local", {
    failureRedirect: "/user/login",
    failureFlash: "Failed to login.",
    successRedirect: "/",
    successFlash: "Logged in!"
  }),

  logout: (req, res, next) => {
    req.logout();
    req.flash('success', 'You have been logged out!');
    res.locals.redirect = "/";
    next();
  },

  createAccount: (req, res, next) => {
    let userParams = {
      name: {
        firstname: req.body.firstname,
        lastname: req.body.lastname
      },
      email: req.body.email,
      role: req.body.role,
      password: req.body.password
    };

    if (req.skip) next();
    let newUSer = new User(userParams);
    User.register(newUSer, req.body.password, (error, user) => {
      console.log('bitte', user);
      if (user) {
        req.flash('success', `The user ${user.fullName} was created successfully!`);
        res.locals.redirect = `/thanks`;
        res.locals.user = user;
        next();
      } else {
        console.log(`Error saving user profile: ${error.message}`);
        res.locals.redirect = "/user/signup";
        req.flash(
          "error",
          `Failed to create user account because: ${error.message}.`
        );
        next();
      }
    })
  },

  showThank: (req, res) => {
    res.render("thanks")
  },

  edit: (req, res, next) => {
    let userId = req.params.id;
    User.findById(userId).then(user => {
      res.locals.user = user;
      res.locals.loggedIn = user;
      res.render("user/edit",
        {
          user: user
        });
    })
      .catch(error => {
        console.log(`Error fetching user by ID: ${error.message}`);
        next(error);
      });
  },
  update: (req, res, next) => {
    let userId = req.params.id;
    let userParams = {
      name: {
        firstname: req.body.firstname,
        lastname: req.body.lastname
      },
      email: req.body.email,
      password: req.body.password
    };
    //we need to use findOneAndUpdate instead of findByIdAndUpdate!
    // User.findByIdAndUpdate(userId, { $set: userParams })
    User.findOneAndUpdate({_id: userId}, {$set: userParams}, {new: true})
      .then(user => {
        res.locals.redirect = `/user/${userId}`;
        res.locals.user = user;
        next();
      })
      .catch(error => {
        console.log(`Error updating user by ID: ${error.message}`);
        next(error);
      });

  },

  renderRecruiterSignUp: (req, res) => {
    res.render("user/signupRecruiter", {
      jobId: req.params.jobId
    });
  },

  renderCandidateSignUp: (req, res) => {
    res.render("user/signupCandidate", {
      candidateId: req.params.candidateId
    });
  },
  /**
   * Restricts access: allow user with certain roles to access the route.
   * @param action what action the user can perform. Value such as readAny, deleteAny etc.
   * @param resource what resource the defined action has permission to operate on e.g. profile.
   */
  grantAccess: (action, resource) => {
    return async (req, res, next) => {
      try {
        // determines if user's role has sufficient permission
        // to perform the specified action of the provided resource.
        const permission = roles.can(req.user.role)[action](resource);
        if (!permission.granted) {
          return res.status(401).json({
            error: "You don't have a permission to perform this action"
          });
        }
        next()
      } catch (error) {
        next(error)
      }
    }
  },

  allowIfLoggedin: async (req, res, next) => {
    try {
      const user = res.locals.loggedIn;
      console.log('allow ', user);
      if (!user)
        return res.status(401).json({
          error: "You need to be logged in to access this route"
        });
      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  },

  /**
   * Shows the questionnaire page for signup.
   */
  renderNewCandidate: (req, res) => {
    res.render('candidates/new');
  },

  /**
   * Shows the questionnaire page for signup and logged in recruiter user.
   */
  renderNewJobOffer: (req, res) => {
    res.render('jobs/new');
  },

  /**
   * Shows only those job offers that are added
   * by a particular logged in recruiter.
   */
  indexJobOffers: (req, res, next) => {
    // let userId = req.params.id;
    let currentUser = res.locals.user;
    Job.find({}).then(jobs => {
      res.locals.jobs = jobs;
      let mappedOffers = jobs.filter(offer => {
        let userAdded = currentUser.jobOffers.some(userOffer => {
          console.log("comparison: ", JSON.stringify(userOffer) === JSON.stringify(offer._id))
          return JSON.stringify(userOffer) === JSON.stringify(offer._id);
        });
        if (userAdded) return offer;

      });
      res.locals.jobs = mappedOffers;
      next();
    })
      .catch((error) => {
        console.log(`Error fetching candidates: ${error.message}`);
        return [];
      })
  },

  indexViewJobOffers: (req, res) => {
    res.render("jobs/index");
  },

  // TODO: Delete this later on. It's only for testing (we don't have a separate file for hardcoded testing)
  addJobOffers: (req, res, next) => {
    let job = new Job({
      job_title: 'Web Developer',
      location: 'New York',
      company_name: 'Salesforce',
      salary: '50.000-60.000',
      description: 'This is a Full Stack Developer position at Salesforce, NY.',
      work_culture_keywords: ['party', 'loose', 'happy'],
      soft_skills: [
        {
        name: 'honesty',
        importance: 4,
      },
      {
        name: 'leadership',
        importance: 3,
      },
      {
        name: 'trust',
        importance: 2,
      }],
      hard_skills: [
        {
        name: 'NodeJS',
        importance: 2,
      },
      {
        name: 'ExpressJS',
        importance: 3,
      },
      {
        name: "Docker",
        importance: 2,
      }],
      other_aspects: ["nothing","specific"],
    })
    job.save().
      then((job) => {
        res.locals.redirect = `/signup/recruiter/${job._id}`;
        next();
      })
  },

  signUpRecruiter: (req, res, next) => {
    let jobId = req.params.jobId;

    let userParams = {
      name: {
        firstname: req.body.firstname,
        lastname: req.body.lastname
      },
      email:req.body.email,
      role:'recruiter',
      password:req.body.password,
      jobOffers:[jobId]
    };

    if (req.skip) next();

    let newUser = new User(userParams);
    User.register(newUser, req.body.password, (error, user) => {
      if (user) {
        req.flash('success', `The user ${user.fullName} was created successfully!`);
        res.locals.redirect = `/thanks`;
        res.locals.user = user;

        // assign userId to the created job
        Job.findOneAndUpdate({_id: jobId}, {$set: {user: user._id}}, {new: true})
        .then(job => {
          next();
        })
        .catch(error => {
          console.log(`Error updating job with user ID: ${error.message}`);
          next(error);
        });
      } else {
        console.log(`Error saving user profile: ${error.message}`);
        res.locals.redirect = "/signup/recruiter";
        req.flash(
          "error",
          `Failed to create user account because: ${error.message}.`
        );
        next();
      }
    })
  },

  // TODO: Delete this later on. It's only for testing (we don't have a separate file for hardcoded testing)
  addCandidate: (req, res, next) => {
    let candidate = new Candidate({
      job_type: 'Internship?',
      expected_salary: '60000-63000',
      preferred_position: 'Full Stack Developer',
      work_experience: ['nothing so far, currently studying'],
      hard_skills: [
        {
        name: "Java",
        importance: 4,
      },
      {
        name: "Javascript",
        importance: 2,
      },
      {
        name: "Python",
        importance: 1,
      }],
      soft_skills: ["no", "idea"],
      other_aspects: [''],
      work_culture_preferences: [
        {
        name: 'boni',
        importance: 3,
      },
      {
        name: 'company parties',
        importance: 4,
      }],
    })
    candidate.save().
      then((candidate) => {
        res.locals.singUpName = {firstname: 'Test', lastname: 'User'};
        res.locals.redirect = `/signup/candidate/${candidate._id}`;
        next();
      })
  },

  signUpCandidate: (req, res, next) => {
    let candidateId = req.params.candidateId;

    let userParams = {
      name: res.locals.signUpName,
      email: req.body.email,
      role: 'candidate',
      password: req.body.password
    };

    if (req.skip) next();

    let newUser = new User(userParams);
    User.register(newUser, req.body.password, (error, user) => {
      if (user) {
        req.flash('success', `The user ${user.fullName} was created successfully!`);
        res.locals.redirect = `/thanks`;
        res.locals.user = user;

        // assign userId to the created candidate profile
        Candidate.findOneAndUpdate({_id: candidateId}, {$set: {user: user._id}}, {new: true})
        .then(candidate => {
          next();
        })
        .catch(error => {
          console.log(`Error updating candidate with user ID: ${error.message}`);
          next(error);
        });
      } else {
        console.log(`Error saving user profile: ${error.message}`);
        res.locals.redirect = "/signup/candidate";
        req.flash(
          "error",
          `Failed to create user account because: ${error.message}.`
        );
        next();
      }
    })
  }
}

 // delete: (req, res, next) => {
  //   let userId = req.params.id;
    // User.findByIdAndRemove(userId)
    //   .then(() => {
    //     res.locals.redirect = "/user/login";
    //     next();
    //   })
    //   .catch(error => {
    //     console.log(`Error deleting user by ID: ${error.message}`);
    //     next();
    //   })
  // },