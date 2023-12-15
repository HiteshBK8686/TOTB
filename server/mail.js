const nodeMailer = require('nodemailer');

function sendEmail(options) {
  let transporter = nodeMailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD
    }
  });

  if(process.env.SEND_MAIL){
    transporter.sendMail(options, (error, info) => {
      console.log(info);
      console.log(error);
    });
  }
}

module.exports = sendEmail;