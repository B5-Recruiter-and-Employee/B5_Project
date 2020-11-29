const mongoose = require("mongoose"),
    mongooseTypePhone = require('mongoose-type-phone'),
    candidateSchema = mongoose.Schema({
        preferred_position: {
            type: String,
            required: true
        },
        start_date: {
            type: Date,
            default: Date.now
        },
        expected_salary: String,
        current_location: String,
        preferred_location: [String],
        willing_to_relocate: Boolean,
        work_experience: [String],
        hard_skills: [String],
        soft_skills: [String],
        other_aspects: [String],
        work_culture_preferences: [{
            type: String,
            required: true
        }],
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    });

    // get the full name of the candidate.
    candidateSchema.virtual('fullName')
	.get(function() {
		return `${this.name.firstname} ${this.name.lastname}`;
    });
    
module.exports = mongoose.model('Candidate', candidateSchema);