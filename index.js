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


app.get("/test-elastic", async (req, res) => {
  try {
    const response = await axios.post("https://api.elasticemail.com/v2/email/send", null, {
      params: {
        apikey: process.env.ELASTIC_API_KEY,
        subject: "✅ HydroSphere - Elastic Email Test",
        from: "newtongaming36@gmail.com",  // your Gmail (sender)
        to: "newtongaming36@gmail.com",    // your Gmail (recipient)
        bodyHtml: `
          <h2>Hello from HydroSphere 🚀</h2>
          <p>This is a test email sent via Elastic Email API from Railway.</p>
        `,
      },
    });

    console.log("✅ Elastic Email sent:", response.data);
    res.status(200).json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("❌ Elastic Email Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Email failed", error: error.message });
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
