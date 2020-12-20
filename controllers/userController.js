const passport = require('passport');
const User = require("../models/user");
const { roles } = require('../roles');
const Candidate = require("../models/candidate");
const Job = require("../models/job_offer");

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
    res.render('user/profile');
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
    User.findByIdAndUpdate(userId, { $set: userParams })
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
  delete: (req, res, next) => {
    let userId = req.params.id;
    User.findByIdAndRemove(userId)
      .then(() => {
        res.locals.redirect = "/user/login";
        next();
      })
      .catch(error => {
        console.log(`Error deleting user by ID: ${error.message}`);
        next();
      })
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
            error: "You don't have enough permission to perform this action"
          });v
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
  // TODO: Uncomment later on, when the questionairre is updated
  // add: (req, res, next) => {
  //   userId = req.params.id;
  //   let candidate = new Candidate({
  //     job_type: req.body.job_type,
  //     expected_salary: req.body.expected_salary,
  //     preferred_position: req.body.preferred_position,
  //     work_experience: req.body.work_experience,
  //     hard_skills: {
  //       name: req.body.name,
  //       importance: req.body.importance,
  //     },
  //     soft_skills: req.body.soft_skills,
  //     other_aspects: req.body.other_aspects,
  //     work_culture_preferences: {
  //       name: req.body.name,
  //       importance: req.body.importance,
  //     },
  //   })
  //   candidate.save().
  //     then((candidate) => {
  //       console.log("candidate:", candidate)
  //       User.findByIdAndUpdate(userId, {
  //         $set: {
  //           candidateProfile: candidate
  //         }
  //       })
  //         .then(user => {
  //           res.locals.redirect = `/user/${user._id}`;
  //           next();
  //         })
  //         .catch(error => {
  //           console.log(`Error updating candidate by ID: ${error.message}`); next(error);
  //         });
  //     })
  // },
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
 */
// TODO: Uncomment
  // addJobOffers: (req, res, next) => {
  //   userId = req.params.id;
  //   let job = new Job({
  //     job_title: req.body.job_title,
  //     location: req.body.location,
  //     company_name: req.body.company_name,
  //     salary: req.body.salary,
  //     description: req.body.description,
  //     work_culture_keywords: req.body.work_culture_keywords,
  //     soft_skills: {
  //       name: req.body.name,
  //       importance: req.body.importance,
  //     },
  //     hard_skills: {
  //       name: req.body.name,
  //       importance: req.body.impotance,
  //     },
  //     other_aspects: req.body.other_aspects,
  //     user: req.body.user,
  //   })
  //   job.save().
  //     then((job) => {
  //       User.findByIdAndUpdate(userId, {
  //         $addToSet: {
  //           jobOffers: job
  //         }
  //       })
  //         .then(user => {

  //           res.locals.redirect = `/user/${user._id}`;
  //           next();
  //         })
  //         .catch(error => {
  //           console.log(`Error updating candidate by ID: ${error.message}`); next(error);
  //         });
  //     })
  // },

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
    let userId = req.params.id;
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
    userId = req.params.id;
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
        User.findByIdAndUpdate(userId, {
          $addToSet: {
            jobOffers: job
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

  // TODO: Delete this later on. It's only for testing (we don't have a separate file for hardcoded testing)
  add: (req, res, next) => {
    userId = req.params.id;
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
  }
}
