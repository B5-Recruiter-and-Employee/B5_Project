const passport = require('passport');
const User = require("../models/user");
const { roles } = require('../roles');
const Candidate = require("../models/candidate");
const { Client } = require('elasticsearch');
const Job = require("../models/job_offer");
const client = new Client({ node: 'http://elasticsearch:9200' });

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

  signup: (req, res) => {
    res.render("user/signup");
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
   * Add the candidate profile information to the user that
   * is currently logged in.
   */
  add: (req, res, next) => {
    userId = req.params.id;
    let candidate = new Candidate({
      preferred_position: req.body.preferred_position,
      soft_skills: req.body.soft_skills,
      other_aspects: req.body.other_aspects,
      //just for elasticsearch testing
      hard_skills: {
        name: req.body.work_culture_preferences,
        importance: 3
      },
      user: userId
    })
    candidate.save().
      then((candidate) => {
        console.log("candidate:", candidate)
        User.findByIdAndUpdate(userId, {
          $set: {
            candidateProfile: candidate
          }
        })
          .then(user => {
            res.locals.redirect = `/user/${user._id}`;
            next();
          })
          .catch(error => {
            console.log(`Error updating candidate by ID: ${error.message}`); next(error);
          });
      })
  },
  /**
   * Shows the questionnaire page for logged in candidate user.
   */
  newCandidateView: (req, res) => {
    let userId = req.params.id;
    console.log("new link", userId);
    User.findById(userId)
      .then(user => {
        res.locals.user = user;
        res.render('candidates/new', {
          user: user
        });
      })
      .catch(error => {
        console.log(`Error fetching user by ID: ${error.message}`);
        next(error);
      });
  },

  /**
 * Add the candidate profile information to the user that
 * is currently logged in. 
 * New jobs are being saved here!
 */
  addJobOffers: (req, res, next) => {
    userId = req.params.id;
    let job = new Job({
      location: req.body.location,
      company_name: req.body.company_name,
      job_title: req.body.job_title,
      salary: req.body.salary,
      description: req.body.description
    })
    job.save().
      then((job) => {
        // User.findByIdAndUpdate(userId, {
          User.findOneAndUpdate({_id : userId}, {
          $addToSet: {
            jobOffers: job
          }},
          {new : true}
          )
          .then(user => {
            req.flash('success', `The job offer has been created successfully!`);
            res.locals.redirect = `/user/${user._id}/offers`;
            //res.locals.redirect = `/user/${user._id}`;
            next();
          })
          .catch(error => {
            console.log(`Error updating candidate by ID: ${error.message}`); next(error);
          });
      })
  },

  /**
 * Shows the questionnaire page for logged in recruiter user.
 */
  newJobOffer: (req, res) => {
    let userId = req.params.id;
    console.log("new link", userId);
    User.findById(userId)
      .then(user => {
        res.locals.user = user;
        res.render('jobs/new', {
          user: user
        });
      })
      .catch(error => {
        console.log(`Error fetching user by ID: ${error.message}`);
        next(error);
      });
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