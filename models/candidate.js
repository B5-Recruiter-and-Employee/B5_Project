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
  var port;
  var host;
  var auth;
  var protocol;
  const BONSAI_URL = process.env.BONSAI_URL;
  if(BONSAI_URL == null || BONSAI_URL == ""){
      port = 9200;
      host = "localhost";
      protocol = "http";
      auth = "";
  }else{
      port = process.env.BONSAI_URL.port;
      host = process.env.BONSAI_URL.host;
      auth = process.env.BONSAI_URL.auth;
      protocol = process.env.BONSAI_URL.protocol;
  }
  //connect to elasticsearch using mongoosastic plugin
  candidateSchema.plugin(mongoosastic, {
      "host": host,
      "port":port,
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
