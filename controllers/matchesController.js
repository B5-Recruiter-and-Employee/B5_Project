const User = require("../models/user");
const Candidate = require("../models/candidate");
const Job = require("../models/job_offer");
module.exports = {
    getAllMatches: (req, res) => {
        res.render("matches/candidates/index");
    },

    getCandidateMatch: (req, res) => {
        res.render("matches/candidates/show");
    },

    getJobMatch: (req, res) => {
        res.render("matches/jobs/show");
    }
}