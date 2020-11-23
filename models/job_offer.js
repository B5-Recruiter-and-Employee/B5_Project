const mongoose = require("mongoose"), 
   
jobSchema = mongoose.Schema({
    job_title: {
        type: String,
        required : true
    },
    // zip_code: {
    //     type: 
    // }
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

// get the full name of the candidate for convenience ex. in candidates.ejs
// jobSchema.virtual('')
// .get(function() {
//     return `${this.name.firstname} ${this.name.lastname}`;
// });

module.exports = mongoose.model('Job', jobSchema);