const axios = require("axios");
const fs = require("fs");


 exports.model = async (req, res) => {
  try {
    const inputData = req.body;
    const response = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: inputData }),
    });

    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error("Error contacting Python API:", error);
    res.status(500).json({ error: "Python API not reachable" });
  }
}




 exports.fetchData = async (req, res) => {
  const { lat, lon } = req.query;

  try {
    
    const elevationRes = await axios.get(
      `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`
    );
    const elevation = elevationRes.data.results[0].elevation;

    const rainfallRes = await axios.get(
      `https://archive-api.open-meteo.com/v1/era5?latitude=${lat}&longitude=${lon}&daily=precipitation_sum&timezone=auto`
    );
    const rainfall = rainfallRes.data.daily.precipitation_sum.slice(-30).reduce((a, b) => a + b, 0); 

    
    const NDVI = Math.random() * 0.6; 

  
    const dist_river = Math.floor(Math.random() * 1500 + 100); 

   
    const slope = Math.random() * 15;

    res.json({
      elevation,
      rainfall,
      NDVI,
      dist_river,
      slope,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch environmental data" });
  }
}

exports.RudraPrayag = async (req , res) => {
      try {
    const data = JSON.parse(
      fs.readFileSync("./data/RudraPrayag.json", "utf8")
    );
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load location list" });
  }

} 