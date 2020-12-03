const mongoose = require("mongoose"),
    mongooseTypePhone = require('mongoose-type-phone'),
    mongoosastic = require("mongoosastic"),

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

//connect to elasticsearch using mongoosastic plugin
candidateSchema.plugin(mongoosastic, {
    "host": "localhost",
    "port" : 9200
});

//create a mongoDB model for the mapping
var Candidate = mongoose.model('Candidate', candidateSchema);

//create a mapping
Candidate.createMapping((err, mapping) => {
    console.log('** elasticsearch mapping created for Candidates');
})

module.exports = mongoose.model('Candidate', candidateSchema);