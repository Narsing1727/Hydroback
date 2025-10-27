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


app.get("/test-email", async (req, res) => {
  try {
    const mailersend = new MailerSend({
      apiKey: process.env.MAILERSEND_API_KEY,
    });

    const sentFrom = new Sender("noreply@mailersend.net", "HydroSphere");
    const recipients = [new Recipient("newtongaming36@gmail.com", "Newton")];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject("✅ HydroSphere MailerSend Test Email")
      .setHtml("<h2>Success!</h2><p>Your MailerSend setup on Railway works perfectly 🚀</p>");

    await mailersend.email.send(emailParams);

    console.log("✅ Test email sent successfully via MailerSend!");
    res.status(200).json({ success: true, message: "Test email sent successfully!" });
  } catch (error) {
    console.error("❌ MailerSend test error:", error);
    res.status(500).json({ success: false, message: "Failed to send test email", error: error.message });
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
