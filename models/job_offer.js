const mongoose = require("mongoose"),
mongoosastic = require("mongoosastic"),

jobSchema = mongoose.Schema({
    job_title: {
        type: String,
        required: true
    },
    location: [String],
    company_name: {
        type: String,
        required: true
    },
    salary: String,
    description: String,
    job_type: String,
    work_culture_keywords: [{
        type: String,
        required: true
    }],
    soft_skills: [{
      name: String,
      importance: {
        type: Number,
        min : 1,
        max : 3,
        required : true
      }
    }],
    hard_skills: [{
      name: String,
      importance: {
        type: Number,
        min : 1,
        max : 3,
        required : true
      }
    }],
    other_aspects: [String],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});


//connect to elasticsearch using mongoosastic plugin
jobSchema.plugin(mongoosastic, {
    "host": "localhost",
    "port": 9200
});

//created a model for mapping
var Job = mongoose.model('Job_offer', jobSchema);

//create a mapping
Job.createMapping((err, mapping) => {
    console.log('** elasticsearch mapping created for Jobs');
});


//exports the mongoDB model
module.exports = mongoose.model('Job_offer', jobSchema);
