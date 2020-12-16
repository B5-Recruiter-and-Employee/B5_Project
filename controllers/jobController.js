const { db } = require("../models/job_offer");
const Job = require("../models/job_offer");
const User = require("../models/user");

module.exports = {
    // getAllJobs: (req, res) => {
    //     Job.find({})
    //         .exec()
    //         .then((jobs) => {
    //             res.render("jobs/index", {
    //                 jobs: jobs
    //             });
    //         })
    //         .catch((error) => {
    //             console.log(error.message);
    //             return [];
    //         })
    //         .then(() => {
    //             console.log("promise complete");
    //         });
    // },
  
    // saveJob: (req, res) => {
    //     let newJob = new Job({
    //         job_title: req.body.job_title,
    //         location: req.body.location,
    //         salary: req.body.salary,
    //         company_name: req.body.company_name,
    //         description: req.body.description,
    //     });
    //     newJob.save()
    //         .then(() => {
    //             res.render('thanks', {
    //                 flashMessages: {
    //                     success: "The job has been created!"
    //                 }
    //             })
    //         })
    //         .catch(error => {
    //             res.send(error);
    //         });
    // },

    // createJobs: (req, res) => {
    //     res.render("jobs/new");
    // },

    renderSingleJob: (req, res) => {
        let jobId = req.params.jobId;

        Job.findOne({ '_id': jobId })
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
    },

    updateJob: (req, res) => {
        let jobId = req.params.jobId;

        jobParams = {
            job_title: req.body.job_title,
            location: req.body.location,
            salary: req.body.salary,
            company_name: req.body.company_name,
            description: req.body.description,
        };

        Job.findByIdAndUpdate(jobId, {
            $set: jobParams
        })
            .then(job => {
                let user = res.locals.user;
                req.flash('success', `The job offer has been updated successfully!`);
                res.redirect(`/user/${user._id}/offers`);
                next();
            })
            .catch(error => {
                req.flash('error', `There has been an error while updating the job offer: ${error.message}`);
                console.log(`Error updating job by ID: ${error.message}`);
                next(error);
            });
    },

    /**
     * Delete the job offer from the whole jobs collection &
     * delete this job offer from the collection of job offers 
     * (jobOffers array in User) create by particular user.
     */
    deleteJob: (req, res) => {
        let jobId = req.params.jobId;

        Job.findByIdAndDelete(jobId)
            .then((job) => {
                let user = res.locals.user;
                console.log('user to update:', user);
                User.findByIdAndUpdate(user._id, {
                    $pull: {
                        jobOffers: job._id
                    }
                })
                    .then((user) => {
                        req.flash('success', `The job offer has been deleted successfully!`);
                        res.redirect(`/user/${user._id}/offers`);
                    })
                    .catch(error => {
                        req.flash('error', `There has been an error while deleting the job offer: ${error.message}`);
                        console.log(`Error deleting job by ID: ${error.message}`);
                        next(error);
                    });
            })

    },
}