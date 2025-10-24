const express = require("express");
const floodRouter = express.Router();

const floodController = require('../controllers/floodController')
const predictionController = require("../controllers/predictionController");
floodRouter.post("/flood-risk", floodController.floodIndex);
floodRouter.post("/prediction" , predictionController.model);
floodRouter.get("/fetch" , predictionController.fetchData);
floodRouter.get("/rudraPrayag" , predictionController.RudraPrayag);
module.exports = floodRouter;