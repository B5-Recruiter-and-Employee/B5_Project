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
        willing_to_relocate: Boolean,
        work_experience: [String],
        hard_skills: [{
          type : String,
          required : true,
        }],
        hardskills_importance : {
          enum : ['very important', 'quite important', 'somewhat important', 'a little bit important', 'not important']
        },
        soft_skills: [{
          type : String,
          required : true
        }],
        other_aspects: [String],
        work_culture_preferences: [{
            type: String,
            required: true
        }],
        workculture_importance :{
            enum : ['very important', 'quite important', 'somewhat important', 'a little bit important', 'not important']
        },
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
