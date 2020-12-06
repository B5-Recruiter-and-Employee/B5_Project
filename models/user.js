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
        // unique: true,
    },
    password: {
        type: String
    },
    role: {
        type:String,
        enum: ["candidate", "recruiter"]
    },
     candidateProfile: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Candidate"
     } //probably we have to add here the associations as well for the convenience. but not sure for now. this is for add method in userController.
});

    // get the full name of the candidate.
userSchema.virtual('fullName')
.get(function() {
	return `${this.name.firstname} ${this.name.lastname}`;
});

userSchema.plugin(passportLocalMongoose, {
    usernameField : "email"
});

module.exports = mongoose.model("User", userSchema);