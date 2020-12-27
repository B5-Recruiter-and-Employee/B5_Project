var data = require ('./collected_data.json');

const mongoose = require("mongoose"),
    Candidate = require("./models/candidate"),
    Job = require("./models/job_offer");



mongoose.connect(
    "mongodb://localhost:27017/rem_matching_test",
    { useNewUrlParser: true }
);

mongoose.connection;

// var candidates = [
//     {
//         preferred_position: 'Hamburger eater',
//         work_culture_preferences: 'Everyone is nice to each other'
//     },
//     {
//         preferred_position: 'Dog sitter',
//         work_culture_preferences: 'Dogs must be able to stand on their hands'
//     },
//     {
//         preferred_position: 'Software engineer',
//         work_culture_preferences: 'I want to beep boop'
//     }
// ];

// var job_offers = [
//     {
//         job_title: 'Carpenter',
//         location: 'LA',
//         company_name: 'Carpenter Inc.',
//         description: 'Small carpenter store in Los Angeles',
//     },
//     {
//         job_title: 'Carpenter',
//         location: 'LA',
//         company_name: 'Carpenter Inc.',
//         description: 'Small carpenter store in Los Angeles',
//     },
//     {
//         job_title: 'Film Maker',
//         location: 'NY',
//         company_name: 'Movie Inc.',
//         description: 'Small movie studio in New York',
//     }
// ]

//DELETE all jobs
//find all jobs, create an array of jobs
// Job.find({}, function(err, jobs_array) {
//     if (err){
//         console.log(err);
//     } else {
//         //Loop through jobs_array and delete all
//          for (i = 0; i < jobs_array.length; i++){
//              jobs_array[i].remove(function (err){
//                 if(err) {
//                     console.log(err)
//                 } else {}
//             });
//          }
//          console.log('-> All jobs deleted from MongoDB and Elasticsearch');    
//     }
// });

//DELETE all candidates
//find all candidates, create an array of candidates
// Candidate.find({}, function(err, cand_array) {
//     if (err){
//         console.log(err);
//     } else {
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

// var cand_array = [];
var job_array = [];

// candidates.forEach((c) => {
//     cand_array.push(Candidate.create({
//         preferred_position: c.preferred_position,
//         work_culture_preferences: c.work_culture_preferences
//     }));
// });

data.forEach((c) => {
    let techstack = [];
    for (let i = 0; i < c.hard_skills.length ; i++){
        techstack.push({
            name : c.hard_skills[i],
            importance : 3
        })
    }
        job_array.push( new Job({
        hard_skills: techstack,
        job_title: c.job_title,
        location: c.location,
        company_name: c.company_name,
        description: c.description,
        work_culture_keywords: c.work_culture_keywords
    }).save());
});

// Promise.all(cand_array)
//     .then(r => {
//         console.log("++ The amount of candidates seeded: " + cand_array.length)
//         mongoose.connection.close();
//     })
//     .catch(error => {
//         console.log(`ERROR: ${error}`);
//     });

 Promise.all(job_array)
    .then(r => {
       console.log("++ The amount of jobs seeded: " + job_array.length)
        mongoose.connection.close();
    })
    .catch(error => {
        console.log(`ERROR: ${error}`);
    });
