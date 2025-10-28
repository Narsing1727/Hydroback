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


app.get("/sendgrid-test", async (_req, res) => {
  try {
    const to = "gamingnewton69@gmail.com";                  // inbox you’re testing
    const fromEmail = process.env.SENDER_EMAIL;             // newtongaming36@gmail.com

    const msg = {
      to,
      from: { email: fromEmail, name: "Hydrosphere" },
      replyTo: fromEmail,
      subject: "Hydrosphere verification test",
      text: "Hi, this is a simple transactional test from Hydrosphere.",
      html: `<p>Hi, this is a simple transactional test from <strong>Hydrosphere</strong>.</p>`,

      // Turn OFF tracking (important for inboxing)
      trackingSettings: {
        clickTracking: { enable: false, enableText: false },
        openTracking: { enable: false },
      },

      // Optional but good: let Gmail know how to unsubscribe
      headers: {
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        "List-Unsubscribe": "<mailto:unsubscribe@example.com>, <https://example.com/unsub>",
      },
    };

    const [resp] = await sgMail.send(msg);
    res.json({
      ok: true,
      status: resp?.statusCode,
      id: resp?.headers?.["x-message-id"] || null,
    });
  } catch (e) {
    console.error(e?.response?.body || e);
    res.status(500).json({ ok: false, error: e.message, details: e?.response?.body || null });
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
