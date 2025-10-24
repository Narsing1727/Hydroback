const nodemailer = require("nodemailer");

exports.feedback = async (req , res) => {


  const { username, message , email , rating } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: "Feedback cannot be empty" });
  }

  try {
    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.FEEDBACK_EMAIL, 
        pass: process.env.FEEDBACK_APP_PASSWORD, 
      },
    });

    
    const mailOptions = {
      from: "no-reply@hydrosphere.com",
      to: process.env.FEEDBACK_EMAIL, 
      subject: `New Feedback from narsing`,
      html: `
        <h3>Hydrosphere Feedback</h3>
        <p><b>From:</b>${username}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Rating:</b> ${rating}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Feedback sent successfully!" });
  } catch (error) {
    console.error("Error sending feedback:", error);
    res.status(500).json({ success: false, message: "Failed to send feedback" });
  }


}
