const express = require("express");
const feedRouter = express.Router();
const feedController = require('../controllers/feedbackController');

feedRouter.post("/send-feedback" , feedController.feedback);

module.exports = feedRouter;
