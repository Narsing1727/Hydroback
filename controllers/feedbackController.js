
const sgMail = require("@sendgrid/mail")
exports.feedback = async (req , res) => {

try{


  const { username, message , email , rating } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: "Feedback cannot be empty" });
  }
 const to = "newtongaming36@gmail.com";              
    const fromEmail = email;          
    const msg = {
      to,
      from: { email: fromEmail, name: `${username}` },
      replyTo: fromEmail,
      subject: "HydroSphere Feedback",
      text: `Hi`,
      html: 
      `<p><strong>Message:</strong> ${message}</p>`
      ,

     
      trackingSettings: {
        clickTracking: { enable: false, enableText: false },
        openTracking: { enable: false },
      },

      
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
      success : true,
      message : "New Password Sent Check Your Spam/Inbox"
    });
}
   catch (error) {
    console.error("Error sending feedback:", error);
    res.status(500).json({ success: false, message: "Failed to send feedback" });
  }


}
