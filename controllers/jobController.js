const { db } = require("../models/job_offer");
const Job = require("../models/job_offer");
const User = require("../models/user");

module.exports = {

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
        let user = req.user; //new

        jobParams = {
            job_title: req.body.job_title,
            location: req.body.location,
            salary: req.body.salary,
            company_name: req.body.company_name,
            description: req.body.description,
        };
    //  Job.findByIdAndUpdate(jobId, { $set: jobParams})
        Job.findOneAndUpdate({_id: jobId}, {$set: jobParams}, {new: true}, (err, job) => {
            if(err) {
                req.flash('error', `There has been an error while updating the job offer: ${error.message}`);
                console.log(`Error updating job by ID: ${error.message}`);
            } else {
                //let user = res.locals.user;
                req.flash('success', `The job has been successfully updated!`);
                res.redirect(`/user/${user._id}/offers`);
                console.log('job updated in MongoDB and Elasticsearch')
            }
        });
     },
     
    /**
     * Delete the job offer from the whole jobs collection &
     * from the collection of job offers (jobOffers array in User) create by particular user.
     */
    deleteJob: (req, res) => {
        let jobId = req.params.jobId;
        let user = req.user;

        Job.findOneAndRemove({_id: jobId})
            .then((job) =>{    
                console.log('user to update:', user);
                // delete job from user's jobs array (both in MongoDB and ES)
                User.findOneAndUpdate({_id : user._id}, 
                {$pull: {jobOffers: job._id}},
                {new : true}   
                    ).then((user) => {
                    console.log('job deleted from the jobOffers Array')
                    req.flash('success', `The job offer has been deleted successfully!`);
                    res.redirect(`/user/${user._id}/offers`);
                })
                .catch(error => {
                    req.flash('error', `There has been an error while deleting the job offer: ${error.message}`);
                     console.log(`Error deleting job by ID: ${error.message}`);
                     next(error);
                })
            })
    },
}

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
    //                 flashMessages: { success: "The job has been created!"}
    //             })
    //             // req.flash('success', `The job offer has been created successfully!`);
    //             // res.redirect(`thanks`);
    //         })
    //         .catch(error => {
    //             res.send(error);
    //         });
    // },

    // createJobs: (req, res) => {
    //     res.render("jobs/new");
    // },