const Job = require("../models/job_offer");
const User = require("../models/user");
const userController = require("./userController");

module.exports = {

    renderSingleJobEdit: (req, res) => {
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
            });
    },

    renderSingleJob: (req, res, next) => {
        let jobId = req.params.jobId

        Job.findById(jobId).then(card => {
            res.render("jobs/showSingleJob", {
                card: card
            });
            next()
        })
            .catch((error) => {
                console.log(error.message);
                return [];
            })
    },

    updateJob: (req, res) => {
        let jobId = req.params.jobId;
        let jobParams = userController.getJobParams(req, res);

        Job.findOneAndUpdate({_id: jobId}, {$set: jobParams}, {new: true}, (err, job) => {
            if(err) {
                req.flash('error', `There has been an error while updating the job offer: ${error.message}`);
                console.log(`Error updating job by ID: ${error.message}`);
            } else {
                req.flash('success', `The job offer "${job.job_title}" has been successfully updated!`);
                res.redirect(`/user/${res.locals.user._id}/offers`);
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