const User = require("../models/user");
const { roles } = require('../roles');
const Candidate = require("../models/candidate");
const Job = require("../models/job_offer");

module.exports = {
    renderSearch: (req, res) => {
        res.render("search/search");
    }
}