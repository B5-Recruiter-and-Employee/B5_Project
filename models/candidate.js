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
  const auth = process.env.BONSAI_AUTH || "";
  const port = process.env.BONSAI_PORT || "9200";
  const protocol = process.env.BONSAI_PROTOCOL || "";
  const host = process.env.BONSAI_HOST || "localhost";
  //connect to elasticsearch using mongoosastic plugin
  candidateSchema.plugin(mongoosastic, {
      "host": host,
      "port": port,
      "auth": auth,
      "protocol": protocol,
  });

//create a mongoDB model for the mapping
var Candidate = mongoose.model('Candidate', candidateSchema);

//create a mapping
Candidate.createMapping((err, mapping) => {
  console.log('** elasticsearch mapping created for Candidates');
})

module.exports = mongoose.model('Candidate', candidateSchema);
