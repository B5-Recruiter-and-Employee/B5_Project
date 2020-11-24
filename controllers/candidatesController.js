const Candidate = require("../models/candidate");

exports.getAllCandidates = (req, res) => {
    Candidate.find({})
        .exec()
        .then((candidates) => {
            res.render("candidates/candidatesOverview", {
                candidates : candidates
            });
        })
        .catch((error) => {
            console.log(error.message);
            return [];
        })
        .then(() => {
            console.log("promise complete");
        });
};

exports.getSubscriptionPage = (req, res) => {
    res.render("candidates/new");
}
exports.saveCandidate = (req, res) => {
    let newCandidate = new Candidate({
        name: {
            firstname: req.body.firstname,
            lastname: req.body.lastname
        },
        email: req.body.email,
    });
    newCandidate.save()
        .then(() => {
            res.render('thanks')
        })
        .catch(error => {
            res.send(error);
        });
};