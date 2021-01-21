const passport = require("passport");
//create route to home page and log requests body
exports.logRequestPaths = (req,res) => {
    console.log(req.body);
    console.log(req.query);
    res.send("POST Succesful!! ")
};

/**
 * Render the index.ejs file (index page) for not logged in user.
 * If the user is already logged in, redirect to profile page.
*/
exports.getIndex = (req, res) => {
    //console.log ("USER", req.user);
    if (!req.isAuthenticated()) {
        res.render("index");
    } else {
        res.redirect('/user/' + req.user._id);
    }
};

//render the name.ejs file with the route parameter as the name variable
exports.respondWithName = (req, res) => {
    let paramsName = req.params.myName;
    res.render("name", { name: paramsName});
};
