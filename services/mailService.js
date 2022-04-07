const nodemailer = require("nodemailer");

const ejs = require("ejs");

let helpers = require('../helpers')

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USERNAME, 
    pass: process.env.MAIL_PASSWORD
  }
});

exports.welcomeBetaTester = async function(mailData) {

    return await transporter.sendMail({
      sender: process.env.MAIL_FROM,
      replyTo: process.env.MAIL_FROM,
      from: process.env.MAIL_FROM, 
      to: mailData.to,
      subject: mailData.subject, 
      html: mailData.message, 
    });
    
}

