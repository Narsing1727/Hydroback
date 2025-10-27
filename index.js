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
  
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // email details
    const mailOptions = {
      from: `"HydroSphere Test" <${process.env.SMTP_EMAIL}>`,
      to: "newtongaming36@gmail.com", // you can put your own email to verify
      subject: "✅ HydroSphere Test Email",
      text: "This is a test email from your Railway backend using Gmail SMTP.",
    };

    // send mail
    await transporter.sendMail(mailOptions);

    console.log("✅ Test email sent successfully!");
    res.status(200).json({ success: true, message: "Test email sent successfully!" });
  } catch (error) {
    console.error("❌ Test email failed:", error);
    res.status(500).json({ success: false, message: "Test email failed", error: error.message });
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
