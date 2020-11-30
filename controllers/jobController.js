const { db } = require("../models/job_offer");
const Job = require("../models/job_offer");

exports.getAllJobs = (req, res) => {
    Job.find({})
        .exec()
        .then((jobs) => {
            res.render("jobs/jobsOverview", { //render jobs.ejs
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
        description: req.body.description,
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

exports.renderSingleJob = (req, res) => {
    let jobId = req.params.jobId;

    Job.findOne({'_id': jobId})
        .exec()
        .then((job) => {
            res.render("jobs/singleJob", { 
                job: job 
            });
        })
        .catch((error) => {
            console.log(error.message);
            return [];
        })
        .then(() => {
            console.log("promise complete");
        });
}

exports.updateJob = (req, res) => {
    let jobId = req.params.jobId;

    jobParams = {
        job_title: req.body.job_title,
        location: req.body.location,
        salary : req.body.salary,
        company_name: req.body.company_name,
        description: req.body.description,
    };

    Job.findByIdAndUpdate(jobId, {
        $set: jobParams
    })
        .then(job => {
            res.redirect(`/jobs/${jobId}`);
            next();
        })
        .catch(error => {
            console.log(`Error updating job by ID: ${error.message}`);
            next(error);
        });
}


exports.deleteJob = (req, res) => {
    let jobId = req.params.jobId;

    Job.findByIdAndDelete(jobId)
        .then(() => {
            res.redirect(`/jobs`);
            next();
        })
        .catch(error => {
            console.log(`Error deleting job by ID: ${error.message}`);
            next(error);
        });
}


