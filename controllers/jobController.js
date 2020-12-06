const { db } = require("../models/job_offer");
const Job = require("../models/job_offer");

exports.getAllJobs = (req, res) => {
    Job.find({})
        .exec()
        .then((jobs) => {
            res.render("jobs/index", { //render jobs.ejs
                jobs: jobs
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
            res.render('thanks', {
                flashMessages: {
                    success: "The job has been created!"
                }
            })
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
            res.render("jobs/edit", { 
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
            req.flash('success', `The job offer has been updated successfully!`);
            res.redirect(`/jobs/${job._id}`);
            next();
        })
        .catch(error => {
            req.flash('error', `There has been an error while updating the job offer: ${error.message}`);
            console.log(`Error updating job by ID: ${error.message}`);
            next(error);
        });
}


exports.deleteJob = (req, res) => {
    let jobId = req.params.jobId;

    Job.findByIdAndDelete(jobId)
        .then(() => {
            req.flash('success', `The job offer has been deleted successfully!`);
            res.redirect(`/jobs`);
            next();
        })
        .catch(error => {
            req.flash('error', `There has been an error while deleting the job offer: ${error.message}`);
            console.log(`Error deleting job by ID: ${error.message}`);
            next(error);
        });
}


