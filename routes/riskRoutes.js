const express = require('express');
const riskRouter = express.Router();
const riskController = require('../controllers/riskZoningController');


riskRouter.post("/zoning" , riskController.riskZoning);

module.exports = riskRouter;