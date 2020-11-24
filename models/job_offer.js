const mongoose = require("mongoose"), 
   
jobSchema = mongoose.Schema({
    job_title: {
        type: String,
        required : true
    },
    location: {
        type: String
    },
    company_name: {
        type: String,
        required : true
    },
    salary: {
        type: Number
    },
    description_text: {
        type: String
    },
    keywords: [{
        type: String
    }]

});

module.exports = mongoose.model('Job', jobSchema);