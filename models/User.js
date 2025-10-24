const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  email: {type : String, unique : true},
  phoneNumber: { type: String, required: true },
  password: String,
 otp: { type: String },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false },
} , {timestamps : true});

module.exports = mongoose.model("User", userSchema);
