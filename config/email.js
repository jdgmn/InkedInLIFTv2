const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    if (!process.env.EMAIL_FROM) {
      throw new Error("EMAIL_FROM not configured");
    }

    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: [to],
      subject,
      html,
    });

    console.log("Email sent:", data.data?.id);
    return data;
  } catch (error) {
    console.error("sendEmail error:", error);
    throw error;
  }
};

module.exports = sendEmail;
