const mongoose = require("mongoose"),
    mongooseTypePhone = require('mongoose-type-phone'),
    mongoosastic = require("mongoosastic"),

    candidateSchema = mongoose.Schema({
        preferred_position: {
            type: String,
            required: true
        },
        job_type : String,
        expected_salary: String,
        current_location: String,
        preferred_location: [String],
        work_experience: [String],
        hard_skills: [{
          name: String,
          importance: {
            type: Number,
            min : 1,
            max : 3,
            required : true
          }
        }],
        soft_skills: [{
          type : String,
          required : true
        }],
        other_aspects: [String],
        work_culture_preferences: [{
          name: String,
          importance: {
            type: Number,
            min : 1,
            max : 3,
            required : true
          }
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
