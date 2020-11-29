const mongoose = require("mongoose"),
    Candidate = require("./models/candidate"),
    Job = require("./models/job_offer");

mongoose.connect(
    "mongodb://localhost:27017/rem_matching_test",
    { useNewUrlParser: true }
);

mongoose.connection;

Candidate.deleteMany()
    .exec()
    .then(() => {
        console.log("Candidates data is empty!");
    });

Job.deleteMany()
    .exec()
    .then(() => {
        console.log("Job data is empty!");
    });