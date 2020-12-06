const passport = require('passport');
const User = require("../models/user");
const { roles } = require('../roles');


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
      next();
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
  // deprecated.
  // authenticate: (req, res, next) => {
  //   User.findOne({
  //     email: req.body.email
  //   })
  //     .then(user => {
  //       if (user && user.password === req.body.password) {
  //         res.locals.redirect = `${user._id}`;
  //         req.flash("success", `${user.fullName}'s logged in successfully!`);
  //         res.locals.user = user;
  //         res.locals.loggedIn = user;
  //         console.log('auth: ', res.locals.loggedIn);
  //         next();
  //       } else {
  //         req.flash("error", "Your account or password is incorrect. Please try again!");
  //         res.locals.redirect = "/user/login";
  //         next();
  //       }
  //     })
  //     .catch(error => {
  //       console.log(`Error loggin in user: ${error.message}`);
  //       next(error);
  //     });
  // },

  createAccount: (req, res, next) => {
    let userParams = {
      name: {
        firstname: req.body.firstname,
        lastname: req.body.lastname
      },
      email: req.body.email,
      role: req.body.role
    };
    // deprecated.
    // User.create(userParams)
    //   .then(user => {
    //     req.flash('success', `The user ${user.fullName} was created successfully!`);
    //     res.locals.redirect = `/user/${userId}`;
    //     res.locals.user = user;
    //     next();
    //   })
    //   .catch(error => {
    //     console.log(`Error saving user profile: ${error.message}`);
    //     res.locals.redirect = "/user/signup";
    //     req.flash(
    //       "error",
    //       `Failed to create user account because: ${error.message}.`
    //     );
    //     next();
    //   });
    if (req.skip) next();
    let newUSer = new User( userParams);
    User.register(newUSer, req.body.password, (error, user) => {
      console.log('bitte', user);
      if (user) {
        req.flash('success', `The user ${user.fullName} was created successfully!`);
         res.locals.redirect = `/user/${user._id}`;
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

  edit: (req, res, next) => {

    let userId = req.params.id;
    User.findById(userId).then(user => {
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
  }

}
