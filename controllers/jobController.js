const { db } = require("../models/job_offer");
const Job = require("../models/job_offer");

//READ
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

//CREATE
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
            console.log('a job saved into both MongoDB and Elasticsearch')
        })
        .catch(error => {
            res.send(error);
        });
}

//render the page where new jobs can be created
exports.createJobs = (req, res) => {
    res.render("jobs/new");
}

//GET a specific job by Id
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
        });}

//UPDATE (WORKS)
exports.updateJob = (req, res, next) => {
    let jobId = req.params.jobId;

    let updatedJob = {
        job_title: req.body.job_title,
        location: req.body.location,
        salary : req.body.salary,
        company_name: req.body.company_name,
        description: req.body.description,
    };

    Job.findOneAndUpdate({_id: jobId}, {$set: updatedJob}, {new: true}, (err, job) => {
        if(err) {
            console.log(`Error updating job by ID: ${error.message}`);
        } else {
            res.redirect(`/jobs/`);
            console.log('job updated in MongoDB and Elasticsearch')
            console.log(job);
        }
    });
 
} 

 //DELETE (WORKS)
exports.deleteJob = (req, res) => {
    let jobId = req.params.jobId;
    Job.findById(jobId, function (err, job){
        job.remove(function (err, job){
            if(err) {
                console.log(err)
            } else {
                console.log('job deleted from MongoDB and Elasticsearch')
                res.redirect(`/jobs/`);
            }
        });
    });
 }