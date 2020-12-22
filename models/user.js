const mongoose = require("mongoose");
const passport = require("passport");
const mongoosastic = require("mongoosastic");
passportLocalMongoose = require("passport-local-mongoose");

userSchema = mongoose.Schema({
    name: {
        firstname: {
            type: String,
            trim: true
        },
        lastname: {
            type: String,
            trim: true
        }
    },
    email: {
        type: String,
        lowercase: true,
    },
    password: {
        type: String
    },
    role: {
        type: String,
        enum: ["candidate", "recruiter"]
    },
    candidateProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Candidate"
    }, 
    jobOffers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job"
    }],
});

// get the full name of the candidate.
userSchema.virtual('fullName')
    .get(function () {
        return `${this.name.firstname} ${this.name.lastname}`;
    });

userSchema.plugin(passportLocalMongoose, {
    usernameField: "email"
});

//connect to elasticsearch using mongoosastic plugin
userSchema.plugin(mongoosastic, {
    "host": "localhost",
    "port" : 9200
});

//create a mongoDB model for the mapping
var User = mongoose.model('User', userSchema);

//create a mapping
User.createMapping((err, mapping) => {
    console.log('** elasticsearch mapping created for Users');
})


module.exports = mongoose.model("User", userSchema);