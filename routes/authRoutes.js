const express = require("express");
const authRouter = express.Router();
const userController = require("../controllers/userController");
const authmiddlerware = require("../middlewares/authmiddleware");


authRouter.post("/login" , userController.login);
authRouter.post("/signup", userController.Signup);
authRouter.get("/logout", userController.logout);
authRouter.post("/verify-otp", userController.VerifyOTP);
authRouter.post("/resend-otp", userController.ResendOTP);
authRouter.put("/update" , authmiddlerware.IsAuth,userController.editProfile);
authRouter.post("/send-otp" , userController.SendOTP);
authRouter.post("/forget"  , userController.ForgotPassword);
module.exports = authRouter;
