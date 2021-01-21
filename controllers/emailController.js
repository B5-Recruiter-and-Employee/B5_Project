const User = require("../models/user");
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
  theme: "default",
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
    var recipient;

    Job.findById(jobId).then(job => {
      job_title = job.job_title;
      if (job.user) {
        User.findById(job.user).then(recruiter => {
          recipient = recruiter.name.firstname;
          
        }).catch((error) => console.error(error)).then(job => {
          let senderName = user.fullName;
          let recipientEmail = "rematch.htw@gmail.com";

          let email = {
            body: {
              greeting: 'Hello',
              name: recipient,
              intro: [`${senderName} is interested in your job offer ${job_title}!`,`<b>Their message:</b>`, `<i>${req.body.message}<i>`],
              action: {
                instructions: 'To see their profile, click here:',
                button: {
                  color: '#9AB3F5',
                  text: `${senderName}'s Profile`,
                  link: `http://localhost:3000/candidates/${user.candidateProfile}`
                }
              },
              outro: `You can start contacting via ${user.email}`,
              signature: 'Sincerely'
            }
          };
          

          let mail = MailGenerator.generate(email);

          let message = {
            from: EMAIL,
            to: recipientEmail,
            subject: "Someone is interested in your job offer!",
            html: mail,
          };

          transporter
            .sendMail(message)
            .then(() => {
              req.flash("success", "Email sent!");
              res.redirect(`/jobs/${jobId}`);
            })
            .catch((error) => console.error(error));
        });
      }
    }).catch((error) => {
      console.log(error.message);
    })
  }
}