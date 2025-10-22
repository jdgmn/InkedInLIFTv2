const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // use app password
  },
});

async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `"InkedInLIFT Gym" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
    console.error("Email error:", error);
  }
}

module.exports = sendEmail;
