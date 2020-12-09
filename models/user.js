const mongoose = require("mongoose");
const passport = require("passport");
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
    }
});

// get the full name of the candidate.
userSchema.virtual('fullName')
    .get(function () {
        return `${this.name.firstname} ${this.name.lastname}`;
    });

userSchema.plugin(passportLocalMongoose, {
    usernameField: "email"
});

module.exports = mongoose.model("User", userSchema);