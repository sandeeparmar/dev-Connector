const nodemailer = require('nodemailer');

async function sendEmail(emailName, subject, text) {
  try {
    if (!emailName || typeof emailName !== "string" || !emailName.trim()) {
      throw new Error("Recipient email address is missing or invalid.");
    }

    if (!subject || !text) {
      throw new Error("Missing email details");
    }
  
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      secure: true,
      port: process.env.SEND_EMAIL_PORTNUMBER,
      auth: {
        user: process.env.SEND_EMAIL_USERNAME,
        pass: process.env.SEND_EMAIL_PASSWORD
      }
    });

    const emailBody = (typeof text === "object" && text !== null)
  ? Object.entries(text).map(([k, v]) => `${k}: ${v}`).join("\n")
  : text;

    
    let info = await transporter.sendMail({
      from: process.env.SEND_EMAIL_USERNAME,
      to: emailName,
      subject: subject,
      text: emailBody
    });

    return info;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
module.exports = sendEmail;