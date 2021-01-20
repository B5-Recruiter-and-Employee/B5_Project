const User = require("../models/user");
const { roles } = require('../roles');
const Candidate = require("../models/candidate");
const Job = require("../models/job_offer");

const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

const EMAIL = "rematch.htw@gmail.com";
const PASSWORD = "rematching";
const MAIN_URL = "http://localhost:3000/";

let transporter = nodemailer.createTransport({
  service: "Gmail",
  secure: true,
  auth: {
    user: EMAIL,
    pass: PASSWORD,
  },
});

let MailGenerator = new Mailgen({
  theme: "salted",
  product: {
    name: "ReMatch",
    link: MAIN_URL,
  },
});

module.exports = {
  sendMail: (req, res) => {
    let user = res.locals.user;
    let jobId = req.params.id;
    let job_title;
    let recipient;

    Job.findById(jobId).then(job => {
      job_title = job.job_title;
      if (job.user) {
        User.findById(job.user).then(recruiter => {
          recipient = recruiter.fullName;
        })
      }
    });

    let senderName = user.fullName;
    let recipientEmail = "ly_yeah@rocketmail.com";

    // TODO: put this into Job.findById()
    // connect form with this
    let email = {
      body: {
          name: recipient,
          intro: `${senderName} is interested in your job offer ${job_title}!`,
          action: {
              instructions: 'To see their profile, click here:',
              button: {
                  color: '#9AB3F5',
                  text: `${senderName}'s Profile`,
                  link: `http://localhost:3000/candidates/${user.candidateProfile}`
              }
          },
          signature: 'Sincerely,\nReMatch'
      }
  };

    let mail = MailGenerator.generate(email);

    let message = {
      from: EMAIL,
      to: recipientEmail,
      subject: "Someone is interested in you!",
      html: mail,
    };

    transporter
      .sendMail(message)
      .then(() => {
        req.flash("success", "Email sent!");
        res.redirect("/");
      })
      .catch((error) => console.error(error));
  }

}