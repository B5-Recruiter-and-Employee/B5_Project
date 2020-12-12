const User = require("../models/user");
const Candidate = require("../models/candidate");
const Job = require("../models/job_offer");
module.exports = {
    getAllMatches: (req, res) => {
        res.render("matches/index");
    },

    getMatch: (req, res) => {
        res.render("matches/show");
    }
}