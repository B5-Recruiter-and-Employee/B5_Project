const mongoose = require("mongoose"),
    Candidate = require("./models/candidate"),
    Job = require("./models/job_offer");

mongoose.connect(
    "mongodb://mongo:27017/rem_matching_test",
    { useNewUrlParser: true }
);

mongoose.connection;

//DELETE all jobs
//find all jobs, create an array of jobs
Job.find({}, function(err, jobs_array) {
    if (err){
        console.log(err);
    } else {
         console.log("-> The amount of jobs you're deleting: " + jobs_array.length);
        //Loop through jobs_array and delete all
         for (i = 0; i < jobs_array.length; i++){
             jobs_array[i].remove(function (err){
                if(err) {
                    console.log(err)
                } else {}
            });
         }
         console.log('-> All jobs deleted from MongoDB and Elasticsearch');    
    }
});

// //DELETE all candidates
// //find all candidates, create an array of candidates
// Candidate.find({}, function(err, cand_array) {
//     if (err){
//         console.log(err);
//     } else {
//          console.log("-> The amount of candidates you're deleting: " + cand_array.length); 
//          //Loop through candidates_array and delete all
//          for (i = 0; i < cand_array.length; i++){
//             cand_array[i].remove(function (err){
//                 if(err) {
//                     console.log(err)
//                 } else {}
//             });
//          }
//          console.log('-> All candidates deleted from MongoDB and Elasticsearch');    
//     }
// });