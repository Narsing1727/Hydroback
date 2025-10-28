const express = require("express");
const cors = require("cors");
const floodRouter = require("./routes/floodRoutes");
const cookie = require("cookie-parser");
const app = express();
const dbConnect = require('./databases/db');
const authRouter = require('./routes/authRoutes');
const postRouter = require("./routes/postRoutes");
const feedRouter = require("./routes/feedRoutes");
const aIRouter = require("./routes/aIRoutes");
const riskRouter = require("./routes/riskRoutes");
const { Resend } = require("resend");
const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");
const nodemailer = require("nodemailer");
const axios = require("axios")
const sgMail = require("@sendgrid/mail")
const PORT = process.env.PORT || 5000;
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(cookie());
app.use(
  cors({
    origin: "https://hydrosphere-2.vercel.app", 
    credentials: true, 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);



sgMail.setApiKey(process.env.SENDGRID_API_KEY);


app.get("/sendgrid-test", async (req, res) => {
  try {
    const msg = {
      to: "gamingnewton69@gmail.com",  // your test inbox
      from: {
        email: "newtongaming36@gmail.com", // newtongaming36@gmail.com
        name: "Hydrosphere Alerts",
      },
      subject: "✅ Hydrosphere Email Test via SendGrid",
      text: "If you're reading this, your SendGrid email system is LIVE! ✅",
      html: `
        <div style="font-family:sans-serif;line-height:1.5">
          <h2>✅ Email Working!</h2>
          <p>Your Render backend successfully sent this email using SendGrid.</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `,
    };

    const [response] = await sgMail.send(msg);
    res.json({
      success: true,
      statusCode: response?.statusCode,
      messageId: response?.headers?.["x-message-id"],
    });
  } catch (err) {
    console.error("SendGrid Error:", err?.response?.body || err.message);
    res.status(500).json({
      success: false,
      error: err.message,
      details: err?.response?.body || null,
    });
  }
});
app.use("/api/v1/hydrosphere", floodRouter);
app.use("/api/v1/hydrosphere/auth" , authRouter);
app.use("/api/v1/hydrosphere/post" , postRouter);
app.use("/api/v1/hydrosphere/feedback", feedRouter);
app.use("/uploads" , express.static("uploads"));
app.use("/api/v1/hydrosphere/ai",aIRouter );
app.use("/api/v1/hydrosphere/risk" , riskRouter)
dbConnect();
app.listen(PORT, "0.0.0.0" , () =>
  console.log("🌐 Backend running on http://localhost:5000")
);
