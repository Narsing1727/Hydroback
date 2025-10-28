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


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL, // Your email
    pass: process.env.SMTP_PASSWORD, // App password (NOT normal Gmail password)
  },
});

// ✅ Test Email Route
app.get("/send-test", async (req, res) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: "narsing_s@ce.iitr.ac.in", 
      subject: "✅ Nodemailer Test Email on Render",
      text: "If you received this, congratsss 🎉 SMTP is working on Render!",
    });

    res.status(200).json({
      success: true,
      message: "Email sent successfully!",
      info,
    });
  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
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
