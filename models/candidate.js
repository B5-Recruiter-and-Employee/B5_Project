const mongoose = require("mongoose"),
  mongoosastic = require("mongoosastic"),

  candidateSchema = mongoose.Schema({
    preferred_position: {
      type: String,
      required: true
    },
    job_type: String,
    expected_salary: String,
    current_location: String,
    preferred_location: [String],
    hard_skills: [{
      name: String,
      importance: {
        type: Number,
        min: 1,
        max: 3,
        required: true
      }
    }],
    soft_skills: [{
      type: String,
      required: true
    }],
    description: String,
    work_culture_preferences: [{
      name: String,
      importance: {
        type: Number,
        min: 1,
        max: 3,
        required: true
      }
    }],
    max_score: Number,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  });
  const bonsai = process.env.BONSAI_URL || "http://localhost:9200";

  //connect to elasticsearch using mongoosastic plugin
  candidateSchema.plugin(mongoosastic, {
      "host": bonsai.host,
      "port":bonsai.port,
      "auth": bonsai.auth,
      "protocol": bonsai.protocol,
  });

//create a mongoDB model for the mapping
var Candidate = mongoose.model('Candidate', candidateSchema);

//create a mapping
Candidate.createMapping((err, mapping) => {
  console.log('** elasticsearch mapping created for Candidates');
})

module.exports = mongoose.model('Candidate', candidateSchema);
