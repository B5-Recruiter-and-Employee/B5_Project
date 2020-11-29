const User = require("../models/user");

exports.getLoginPage = (req, res) => {
    res.render("user/login");
};