const User = require("../models/user");


module.exports = {
    login: (req, res) => {
        res.render("user/login");

    },

    redirectView: (req, res, next) => {
        let redirectPath = res.locals.redirect;
        if (redirectPath) res.redirect(redirectPath);
        else next();
    },

    show: (req, res, next) => {
		let userId = req.params.id;
		User.findById(userId).then(user => {
			res.locals.user = user;
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

    authenticate: (req, res, next) => {
        User.findOne({
            email: req.body.email
        })
            .then(user => {
                if(user && user.password === req.body.password){
                    res.locals.redirect = `${user._id}`;
                    req.flash("success", `${user.fullName}'s logged in successfully!`);
                    res.locals.user = user;
                    next();
                } else {
                    req.flash("error", "Your account or password is incorrect. Please try again!");
                    res.locals.redirect = "/user/login";
                    next();
                }
            })
                .catch(error => {
                    console.log(`Error loggin in user: ${error.message}`);
                    next(error);
                });
    },

    createAccount: (req, res, next) => {
		let userParams = {
            name: {
                firstname: req.body.firstname,
                lastname: req.body.lastname
            },
            email: req.body.email,
            password: req.body.password
        };
        User.create(userParams)
			.then(user => {
        req.flash('success', `The user ${user.fullName} was created successfully!`);
				res.locals.redirect = `/user/${userId}`;
				res.locals.user = user;
				next();
			})
			.catch(error => {
        console.log(`Error saving user profile: ${error.message}`);
        res.locals.redirect = "/user/signup";
        req.flash(
          "error", 
          `Failed to create user account because: ${error.message}.`
        );
				next();
			});
    },

    edit: (req,res,next)=>{

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
      update: (req,res,next) => {
        let userId = req.params.id;
        let userParams = {
            name: {
                firstname: req.body.firstname,
                lastname: req.body.lastname
            },
            email: req.body.email,
            password: req.body.password
        };
        User.findByIdAndUpdate(userId, { $set: userParams})
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
    }
}
