const User = require("../models/user");

exports.getLoginPage = (req, res) => {
    res.render("user/login");
};

exports.getSignupPage = (req, res) => {
    res.render("user/signup");
}

exports.getThanksPage = (req, res) => {
    res.render("thanks");
};
