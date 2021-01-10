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
/**
 * Shows the view of single match (job offer or candidate) 
 * or a profile page of a logged in use (recruiter or candidate). 
 */
  showView: (req, res) => {
    let userId = req.params.id;
    User.findById(userId).then(user => {
      if (user.candidateProfile) {
        Candidate.findById(user.candidateProfile).then(candidate => {
          res.render('user/profile', {
            card: candidate,
            cardOwner: { name: user.fullName, email: user.email }
          });
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
    User.findOneAndUpdate({ _id: userId }, { $set: userParams }, { new: true })
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
      candidateId: req.params.candidateId,
      fname: req.query.firstname,
      lname: req.query.lastname
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
        User.findOneAndUpdate({ _id: userId }, {
          $addToSet: {
            jobOffers: job
          }
        },
          { new: true }
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

  /**
   * Add a new job offer during signup or when recruiter is logged in.
   * 
   */
  
    
    : (req, res, next) => {
    // get the bootstrap tag inputs and convert them to fit to our DB model
    let techArray = [req.body.techstack1, req.body.techstack2, req.body.techstack3];
    let techstack = convertTagsInput(techArray);
    let softskillsArray = [req.body.softskill1, req.body.softskill2, req.body.softskill3];
    let softskills = convertTagsInput(softskillsArray);

    // location + remote work question
    let location = [req.body.location];
    if (!req.body.location) {
      location = [];
    }
    let remote = req.body.remote;
    console.log(remote);
    if (remote) {
      location.push(remote);
    }

    //work culture checkboxes and input
    let  workculture = [];
    if(req.body.extras){
      if (Array.isArray(req.body.extras)) {
        workculture = req.body.extras;
      }else{
        workculture = [req.body.extras];
      }
    }
    if (req.body.work_culture_keywords){
      if (Array.isArray(req.body.work_culture_keywords)){
        req.body.work_culture_keywords.forEach(e => {
          workculture.push(e);
        });
      }else{
      workculture.push(req.body.work_culture_keywords);
    }
    }

    console.log(workculture);
    let job = new Job({
      job_title: req.body.job_title,
      location: location,
      company_name: req.body.company_name,
      salary: req.body.salary,
      description: req.body.description,
      work_culture_keywords: workculture,
      job_type: req.body.job_type,
      soft_skills: softskills,
      hard_skills: techstack,
    })
    job.save().
      then((job) => {
        let userId = req.params.id;
        // if recruiter is logged in (= on route with userId)
        if (userId) {
          User.findOneAndUpdate({ _id: userId }, {
            $addToSet: {
              jobOffers: job
            }
          },
            { new: true }
          )
            .then(user => {
              req.flash('success', `The job offer has been created successfully!`);
              res.locals.redirect = `/user/${user._id}/offers`;
              next();
            })
            .catch(error => {
              console.log(`ADD JOB: Error updating user. ${error.message}`);
              next(error);
            });
        } else {
          // else: not logged in, redirect to user signup page
          res.locals.redirect = `/signup/recruiter/${job._id}`;
          next();
        }
      })
  },

  signUpRecruiter: (req, res, next) => {
    let jobId = req.params.jobId;

    let userParams = {
      name: {
        firstname: req.body.firstname,
        lastname: req.body.lastname
      },
      email: req.body.email,
      role: 'recruiter',
      password: req.body.password,
      jobOffers: [jobId]
    };

    if (req.skip) next();

    let newUser = new User(userParams);
    User.register(newUser, req.body.password, (error, user) => {
      if (user) {
        req.flash('success', `The user ${user.fullName} was created successfully!`);
        res.locals.redirect = `/thanks`;
        res.locals.user = user;

        // assign userId to the created job
        Job.findOneAndUpdate({ _id: jobId }, { $set: { user: user._id } }, { new: true })
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

  /**
   * Add new candidate information when user first sign up
   */
  addCandidate: (req, res, next) => {
    let techArray = [req.body.techstack1, req.body.techstack2, req.body.techstack3];
    let techstack = convertTagsInput(techArray);
    let workcultureArray = [req.body.workculture1, req.body.workculture2, req.body.workculture3];
    let work_culture_preferences = convertTagsInput(workcultureArray);

    // preferred location + remote work question
    let location =[]; 
    if (Array.isArray(req.body.preferred_location)) {
      location = req.body.preferred_location;
    }
    else{
      location = [req.body.preferred_location];
    }
   
    let remote = req.body.remote;
    console.log(remote);
    if (remote) {
      location.push(remote);
    }

    let candidate = new Candidate({
      current_location: req.body.current_location,
      preferred_location: location,
      job_type: req.body.job_type,
      expected_salary: req.body.salary,
      preferred_position: req.body.preferred_position,
      description: req.body.description,
      hard_skills: techstack,
      soft_skills: req.body.soft_skills,
      work_culture_preferences: work_culture_preferences,
    })
    candidate.save().
      then((candidate) => {
        //res.locals.signUpName = {firstname: 'Test', lastname: 'User'};
        res.locals.redirect = `/signup/candidate/${candidate._id}?firstname=${req.body.firstname}&lastname=${req.body.lastname}`;
        next();
      })
  },

  signUpCandidate: (req, res, next) => {
    let candidateId = req.params.candidateId;

    let userParams = {
      name: {
        firstname: req.query.firstname,
        lastname: req.query.lastname
      },
      email: req.body.email,
      role: 'candidate',
      password: req.body.password,
      candidateProfile: candidateId
    };

    if (req.skip) next();

    let newUser = new User(userParams);
    User.register(newUser, req.body.password, (error, user) => {
      if (user) {
        req.flash('success', `The user ${user.fullName} was created successfully!`);
        res.locals.redirect = `/thanks`;
        res.locals.user = user;

        // assign userId to the created candidate profile
        Candidate.findOneAndUpdate({ _id: candidateId }, { $set: { user: user._id } }, { new: true })
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

/**
 * This function is used for creating an array from input tags. 
 * @param {tags} tags array of tagsinput from bootstrap, they should be sorted from 1 to 4 not the other way around
 * @returns array of keyword-objects with importance {name, importance}
 */
let convertTagsInput = (tags) => {
  let tagsinput = [];
  for (let i = 1; i <= tags.length; i++) {
    if (Array.isArray(tags[i])) {
      for (let j = 0; j < tags[i].length; j++) {
        tagsinput.push({
          name: tags[i][j],
          importance: i
        });
      }
    }
    else if (typeof tags[i] === 'undefined') {
      //do nothing
    } else {
      tagsinput.push({
        name: tags[i],
        importance: i
      })
    }
  }
  return tagsinput;
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