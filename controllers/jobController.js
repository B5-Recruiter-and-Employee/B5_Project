const Job = require("../models/job_offer");

exports.getAllJobs = (req, res) => {
    Job.find({})
        .exec()
        .then((jobs) => {
            res.render("jobs/jobs", { //render jobs.ejs
                jobs: jobs // assign jobs to jobs property
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

exports.saveJob = (req, res) => {
    let newJob = new Job({
        job_title: req.body.job_title,
        location: req.body.location,
        salary : req.body.salary,
        company_name: req.body.company_name,
        description_text: req.body.description_text,
    });
    newJob.save()
        .then(() => {
            res.render('thanks')
        })
        .catch(error => {
            res.send(error);
        });
};

exports.createJobs = (req, res) => {
    res.render("jobs/new");
}
