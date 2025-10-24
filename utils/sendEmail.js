const nodemailer = require("nodemailer");

const sendVerificationEmail = async (email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const verifyUrl = `http://localhost:5000/api/v1/auth/verify/${token}`;

    await transporter.sendMail({
      from: `"HydroSphere Team" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Verify your HydroSphere Account 🌊",
      html: `
        <h2>Welcome to HydroSphere!</h2>
        <p>Please verify your email by clicking the button below:</p>
        <a href="${verifyUrl}" style="
          display:inline-block;
          padding:10px 20px;
          background:#007BFF;
          color:white;
          border-radius:5px;
          text-decoration:none;">
          Verify Email
        </a>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error("❌ Email send error:", error.message);
  }
};



module.exports = sendVerificationEmail;