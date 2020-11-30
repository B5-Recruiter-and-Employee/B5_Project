const mongoose = require("mongoose"), 
   
jobSchema = mongoose.Schema({
    job_title: {
        type: String,
        required: true
    },
    location: String,
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
    soft_skills: [String],
    hard_skills: [String],
    other_aspects: [String],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});

module.exports = mongoose.model('Job', jobSchema);