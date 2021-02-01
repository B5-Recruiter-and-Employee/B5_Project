const User = require("../models/user");
const Job = require("../models/job_offer");
const Candidate = require("../models/candidate");

const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

//if you run it local change it to your own email account
const EMAIL = process.env.GMAIL_ADD;
const PASSWORD = process.env.GMAIL_PWD;


const MAIN_URL = "http://rematch-htw.herokuapp.com/";

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
      try {
        card = await Job.findById(cardId);
        job_title = card.job_title;
        redirect = `/jobs/${cardId}`;
      } catch (error) {
        console.error(`Error while trying to find the job ${cardId}:\n`, error);
        // RESPOND WITH INTERNAL ERROR
      }
    } else if (user.role === 'recruiter') {
      try {
        card = await Candidate.findById(cardId);
        jobId = req.body.job;
        let job = await Job.findById(jobId);
        job_title = job.job_title;
        redirect = `/candidates/${cardId}`;
      } catch (error) {
        console.error(`Error while trying to find the job (${jobId}) or candidate (${cardId}):\n`, error);
        // RESPOND WITH INTERNAL ERROR
      }
    }

    if (card.user) {
      try {
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

        let message = {
          from: EMAIL,
          to: recipientEmail,
          subject: subject,
          html: mail,
        };

        await transporter.sendMail(message);
        req.flash("success", "Message sent!");
        res.redirect(redirect);
      } catch (error) {
        console.error(`Error while send an email to card owner (${card.user}):\n`, error);
      }
    } else {
      console.log("ERROR: No user ID exists for this card.");
      req.flash("error", "Message was not sent due to an error. Please try again later or contact the site administrator.");
      res.redirect(redirect);
    }
  }
}