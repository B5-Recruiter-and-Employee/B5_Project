const mongoose = require("mongoose");

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
        unique: true,
    }
});

    // get the full name of the candidate.
userSchema.virtual('fullName')
.get(function() {
	return `${this.name.firstname} ${this.name.lastname}`;
});

exports = mongoose.model("User", userSchema);