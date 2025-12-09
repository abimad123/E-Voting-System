// utils/sendEmail.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',                       // or smtp config
  auth: {
    user: process.env.EMAIL_USER,         // your email
    pass: process.env.EMAIL_PASS,         // app password
  },
});

async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: `"Official E-Voting Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
