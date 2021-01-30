/**
 * Render the index.ejs file (index page) for not logged in user.
 * If the user is already logged in, redirect to profile page.
*/
exports.getIndex = (req, res) => {
    //console.log ("USER", req.user);
    if (!req.isAuthenticated()) {
        res.render("index");
    } else {
        res.redirect('/matches/' + req.user._id);
    }
};
