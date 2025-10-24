const express = require("express");
const aIRouter = express.Router();
const aiController = require("../controllers/aiController");

aIRouter.post("/chat" , aiController.chatWithAI);


module.exports = aIRouter;