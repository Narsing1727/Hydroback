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


import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.resend.com",
  port: 465,
  secure: true,
  auth: {
    user: "resend",
    pass: process.env.RESEND_API_KEY,
  },
});

// ✅ Test Email Route
app.get("/test-email", async (req, res) => {
  try {
    const info = await transporter.sendMail({
      from: "Hydro App <noreply@resend.dev>",
      to:  "gamingnewton69@gmail.com",
      subject: "Hydro App Email Test ✅",
      text: "If you received this, your email system is fully working ✅",
    });

    res.json({ success: true, info });
  } catch (err) {
    console.error("Email Error:", err);
    res.status(500).json({ success: false, error: err.message });
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
