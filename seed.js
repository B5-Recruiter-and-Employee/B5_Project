const mongoose = require("mongoose"),
    Candidate = require("./models/candidate"),
    Job = require("./models/job_offer");

mongoose.connect(
    "mongodb://localhost:27017/rem_matching_test",
    { useNewUrlParser: true }
);

mongoose.connection;

//program doesn't push the first element for some reason. So I just hardcoded the first one twice :/
var candidates = [
    {
        name: {
            firstname: "John",
            lastname: "Smith"
        },
        email: "John@Smith.com",
    },
    {
        name: {
            firstname: "John",
            lastname: "Smith"
        },
        email: "John@Smith.com",
    },
    {
        name: {
            firstname: "Hans",
            lastname: "Zimmer"
        },
        email: "Hans@Zimmer.com",
    },
    {
        name: {
            firstname: "Julia",
            lastname: "Romero"
        },
        email: "Julia@Romero.com",
    },
    {
        name: {
            firstname: "Quentin",
            lastname: "Tarantino"
        },
        email: "Quentin@Tarantino.com",
    },
    {
        name: {
            firstname: "Frodo",
            lastname: "Baggins"
        },
        email: "Frodo@Middleearth.com",
    }
];


var job_offers = [
    {
        job_title: 'Carpenter',
        location: 'LA',
        company_name: 'Carpenter Inc.',
        description_text: 'Small carpenter store in Los Angeles',
    },
    {
        job_title: 'Carpenter',
        location: 'LA',
        company_name: 'Carpenter Inc.',
        description_text: 'Small carpenter store in Los Angeles',
    },
    {
        job_title: 'Film Maker',
        location: 'NY',
        company_name: 'Movie Inc.',
        description_text: 'Small movie studio in New York',
    }
]

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

var commands = [];
var commands2 = [];

candidates.forEach((c) => {
    commands.push(Candidate.create({
        name: {
            firstname: c.firstname,
            lastname: c.lastname
        },
        email: c.email
    }));
});

job_offers.forEach((c) => {
    commands2.push(Job.create({
        job_title: c.job_title,
        location: c.location,
        company_name: c.company_name,
        description_text: c.description_text
    }));
});

Promise.all(commands)
    .then(r => {
        console.log(JSON.stringify(r));
        mongoose.connection.close();
    })
    .catch(error => {
        console.log(`ERROR: ${error}`);
    });

Promise.all(commands2)
    .then(r => {
        console.log(JSON.stringify(r));
        mongoose.connection.close();
    })
    .catch(error => {
        console.log(`ERROR: ${error}`);
    });
