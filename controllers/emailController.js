const User = require("../models/user");
const Job = require("../models/job_offer");
const Candidate = require("../models/candidate");

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
  sendMail: async (req, res) => {
    let user = res.locals.user;
    let cardId = req.params.id;
    let job_title;
    let jobId;
    let recipient;
    let redirect;

    let card
    if (user.role === 'candidate') {
      card = await Job.findById(cardId);
      job_title = card.job_title;
      redirect = `/jobs/${cardId}`;
    } else if (user.role === 'recruiter') {
      card = await Candidate.findById(cardId);
      jobId = req.body.job;
      let job = await Job.findById(jobId);
      job_title = job.job_title;
      redirect = `/candidates/${cardId}`;
    }

    if (card.user) {
      let cardOwner = await User.findById(card.user);
      recipient = cardOwner.name.firstname;
      let senderName = user.fullName;
      let recipientEmail = "rematch.htw@gmail.com"; // when we have real users, replace this with cardOwner.email

      let intro, buttonText, link;
      if (user.role === 'candidate') {
        intro = `${senderName} is interested in your job offer <b>${job_title}</b>!`;
        buttonText = `${senderName}'s Profile`;
        link = `http://localhost:3000/candidates/${user.candidateProfile}`;
      } else if (user.role === 'recruiter') {
        intro = `${senderName} thinks that the job <b>${job_title}</b> might interest you!`;
        buttonText = `${senderName}'s Job Offer`;
        link = `http://localhost:3000/jobs/${jobId}`;
      }
      console.log("+++++ EMAIL CONTROLLER\n", intro, "\n", buttonText, "\n", link);

      let email = {
        body: {
          greeting: 'Hello',
          name: recipient,
          intro: [intro, `Here's their message:`,
            `<blockquote style="text-align:center;"><i>${req.body.message}<i></blockquote>`],
          action: {
            instructions: '<div style="text-align:center; margin-top:30px;">To see their profile, click here:</div>',
            button: {
              color: '#9AB3F5',
              text: buttonText,
              link: link
            }
          },
          outro: `You can start contacting them via ${user.email}.`,
          signature: 'Sincerely'
        }
      };

      let mail = MailGenerator.generate(email);

      let subject;
      if (user.role === 'candidate') {
        subject = `Someone is interested in your offer!`;
      } else if (user.role === 'recruiter') {
        subject = `You might be the perfect match for this offer!`;
      }
      console.log("+++++ EMAIL CONTROLLER\n", subject, "\n", redirect);

      let message = {
        from: EMAIL,
        to: recipientEmail,
        subject: subject,
        html: mail,
      };

      transporter.sendMail(message)
        .then(() => {
          req.flash("success", "Message sent!");
          res.redirect(redirect);
        })
        .catch((error) => console.error(error));
    } else {
      req.flash("error", "Message was not sent due to an error. Please try again");
      res.redirect(redirect);
    }
  }
}