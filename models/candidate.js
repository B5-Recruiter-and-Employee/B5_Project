const mongoose = require("mongoose"),
    mongooseTypePhone = require('mongoose-type-phone'),
    candidateSchema = mongoose.Schema({
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
        workrole: {
            type: String
        },
        email: {
            type: String,
            lowercase: true,
            unique: true,
        },
        // validates phone number & allows empty strings
        phone: {
            type: mongoose.SchemaTypes.Phone,
            allowBlank: true
        },
        hard_skills: [{
            type: String
        }],
        soft_skills: [{
            type: String
        }],
        preferred_location: [{
            type: String
        }],
        current_Location: {
            type: String
        },
        relocate: Boolean,
        expected_salary: Number,
        start_date: {
            type: Date,
            default: Date.now
        }
    });

    // get the full name of the candidate.
    candidateSchema.virtual('fullName')
	.get(function() {
		return `${this.name.firstname} ${this.name.lastname}`;
    });
    
module.exports = mongoose.model('Candidate', candidateSchema);