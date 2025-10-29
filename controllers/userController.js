const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const hash = require("bcryptjs");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const TempUser  = require("../models/TempUser");
const {Resend} = require("resend");
const sgMail = require("@sendgrid/mail")

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
exports.Signup = async (req, res) => {
   try {
    const { username, email, phoneNumber, password } = req.body;
    if (!username || !email || !phoneNumber || !password) {
      return res.status(400).json({
        success: false,
        message: "Something is missing",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        message: "Email already exists ",
        success: false,
      });
    }

    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Phone number already registered" });
    }

    const genSalt = await hash.genSalt(10);
    const hashedPassword = await hash.hash(password, genSalt);

    
    const user = await User.create({
      username,
      email,
      phoneNumber,
      password: hashedPassword,
   
    });

  
  
  

    res.status(200).json({
      success: true,
      message:
        "Sign up successful! Please verify your email to activate your account.",
      user,
    });
  } catch (error) {
    console.log("Signup error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }

};

exports.login = async (req, res) => {

  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing fields",
      });
    }

    const loginUser = await User.findOne({ email });
    if (!loginUser) {
      return res.status(400).json({
        message: "User does not exist",
        success: false,
      });
    }
const isPm = await hash.compare(password, loginUser.password);
    if (!isPm) {
      return res.status(400).json({
        message: "Email or password is wrong",
        success: false,
      });
    }

    const token = await jwt.sign(
      { userId: loginUser._id },
      "123456789",
      { expiresIn: "1d" }
    );

    const userData = {
      userid: loginUser._id,
      username: loginUser.username,
      email: loginUser.email,
      phoneNumber: loginUser.phoneNumber,
      signupDate: loginUser.createdAt,
    };
console.log(userData);
console.log(req.id);

    return res
      .status(200)
      .cookie("token", token, {
    maxAge: 1 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: false, 
    sameSite: "lax", 
     path: "/",
      })
      .json({
        message: `Welcome ${userData.username}`,
        success: true,
        userData,
      });
  } catch (error) {
    console.log(error);
  }
};

exports.logout = (req, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "Logout successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.editProfile = async (req , res) => {
  try {
    const userId = req.id;
    console.log(req.id);
    
    const {nUsername , nPhoneNumber , nEmail} = req.body;

const fUser = await User.findById(userId);
if(nUsername){
  fUser.username = nUsername;
}
if(nPhoneNumber){
  fUser.phoneNumber = nPhoneNumber;
}
if(nEmail){
  fUser.email = nEmail;
}
await fUser.save();
return res.status(200).json({
  success : true,
  message : "Profile Updated",
  user : fUser
})
  } catch (error) {
    console.log(error);
    
  }
}
exports.VerifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });

    const tempUser = await TempUser.findOne({ email });
    if (!tempUser)
      return res
        .status(404)
        .json({ success: false, message: "No OTP found for this email" });

    if (tempUser.otp !== otp)
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP" });

    if (tempUser.otpExpires < Date.now())
      return res
        .status(400)
        .json({ success: false, message: "OTP expired" });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      existingUser.isVerified = true;
      await existingUser.save();
    }

    await TempUser.deleteOne({ email });

    res
      .status(200)
      .json({ success: true, message: "Email verified successfully!" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during OTP verification" });
  }
};

exports.ResendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"HydroSphere" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Your new HydroSphere OTP Code",
      html: `<h2>${otp}</h2><p>Use this OTP within 5 minutes.</p>`,
    });

    res.status(200).json({ success: true, message: "New OTP sent to email" });
  } catch (error) {
    console.log("Resend OTP error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.SendOTP = async (req, res) => {
  try {
    
    const { email } = req.body;

    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });

  
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email already verified" });
    }


    const otp = Math.floor(100000 + Math.random() * 900000).toString();

   
    await TempUser.findOneAndUpdate(
      { email },
      { otp, otpExpires: Date.now() + 5 * 60 * 1000 },
      { upsert: true, new: true }
    );




     
       const resend = new Resend(process.env.RESEND_API_KEY);

    const response = await resend.emails.send({
     from: "HydroSphere <noreply@hydrosphere.tech>",
      to: email,
      subject: "HydroSphere - Your OTP Code",
      html: `
        <h3>HydroSphere Email Verification</h3>
        <p>Your One-Time Password (OTP) for verification is:</p>
        <h2>${otp}</h2>
        <p>This OTP will expire in 5 minutes.</p>
        <br/>
        <p>— HydroSphere Team</p>
      `,
    });


console.log("Email received from frontend:", email);

console.log("📩 Resend response:", JSON.stringify(response, null, 2));
    res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email!",
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error while sending OTP" });
  }
};



exports.ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
console.log("BODY:", req.body);

    if (!email)
      return res.status(400).json({ success: false, message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const tempPassword = Math.random().toString(36).slice(-8);

    const genSalt = await hash.genSalt(10);
    const hashedTemp = await hash.hash(tempPassword, genSalt);
    user.password = hashedTemp;
    await user.save();

    
   
    const to = email;              
    const fromEmail = "newtongaming36@gmail.com";          

    const msg = {
      to,
      from: { email: fromEmail, name: "Hydrosphere" },
      replyTo: fromEmail,
      subject: "Hydrosphere Password Reset",
      text: `Hi, ${user.username} this is a reset password mail from Hydrosphere.`,
      html: `<p>Your new password is ${tempPassword}</p>`,

     
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
  
  } catch (error) {
    console.error("Forgot password error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
