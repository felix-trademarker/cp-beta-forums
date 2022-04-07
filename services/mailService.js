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
      sender: "ChinesePod Team <beta@chinesepod.com>",
      replyTo: "ChinesePod Team <beta@chinesepod.com>",
      from: "ChinesePod Team <beta@chinesepod.com>", 
      to: mailData.to,
      bcc: ["felix@bigfoot.com", "carissa@chinesepod.com"],
      subject: mailData.subject, 
      html: mailData.message, 
    });
    
}

