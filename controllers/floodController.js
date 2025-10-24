const ee = require("@google/earthengine");
const { GoogleAuth } = require("google-auth-library");
const { readFileSync } = require("fs");


const PRIVATE_KEY = JSON.parse(readFileSync("gee-key.json", "utf8"));

const auth = new GoogleAuth({
  credentials: PRIVATE_KEY,
  scopes: ["https://www.googleapis.com/auth/earthengine.readonly"],
});

auth.getClient().then(() => {
  ee.data.authenticateViaPrivateKey(PRIVATE_KEY, () => {
    ee.initialize(null, null, () => console.log("✅ Earth Engine initialized"), console.error);
  });
});

function safeImage(collection, name, operation = "median", fallback = 0) {
  const size = collection.size();
  return ee.Image(
    ee.Algorithms.If(
      size.gt(0),
      ee.Algorithms.If(
        operation === "sum",
        collection.sum(),
        operation === "mean" ? collection.mean() : collection.median()
      ),
      ee.Image.constant(fallback)
    )
  ).aside(() => {
  
    size.evaluate((count) => {
      if (count === 0) {
        console.log(`⚠️ [${name}] → Empty ImageCollection. Using fallback constant (${fallback}).`);
      } else {
        console.log(`✅ [${name}] → Found ${count} images.`);
      }
    });
  });
}

function safeAdd(img1, img2, label1, label2) {
  const valid1 = ee.Algorithms.If(
    ee.Algorithms.IsEqual(ee.Image(img1).bandNames().size(), 0),
    ee.Image.constant(0),
    img1
  );
  const valid2 = ee.Algorithms.If(
    ee.Algorithms.IsEqual(ee.Image(img2).bandNames().size(), 0),
    ee.Image.constant(0),
    img2
  );

  return ee.Image(valid1)
    .add(ee.Image(valid2))
    .aside(() => console.log(`🧩 Added [${label1}] + [${label2}]`));
}


exports.floodIndex = async (req, res) => {
  try {
    const { lat, lon } = req.body;
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    console.log("\n📩 Request received:", { latNum, lonNum });

    if (isNaN(latNum) || isNaN(lonNum)) {
      return res.status(400).json({ error: "Invalid latitude or longitude" });
    }

    const point = ee.Geometry.Point([lonNum, latNum]);
    const roi = point.buffer(8000); 

  
    const chirps = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
      .filterDate("2025-08-15", "2025-08-16")
      .filterBounds(roi);
    const rainfall = safeImage(chirps, "CHIRPS Rainfall", "sum", 0)
      .unitScale(0, 300)
      .multiply(25)
      .rename("rainfall");

   
    const smap = ee.ImageCollection("NASA/SMAP/SPL4SMGP/007")
      .filterDate("2025-08-08", "2025-08-16")
      .filterBounds(roi)
      .select("sm_surface");
    const soil = safeImage(smap, "SMAP Soil Moisture", "median", 0.3)
      .unitScale(0.1, 0.5)
      .multiply(20)
      .rename("soil");

    const elevationBase = ee.Image("USGS/SRTMGL1_003").select("elevation").clip(roi);
    const slope = ee.Terrain.slope(elevationBase)
      .multiply(-1)
      .add(45)
      .unitScale(0, 45)
      .multiply(15)
      .rename("slope");

  
    const elevation = elevationBase
      .multiply(-1)
      .add(3000)
      .unitScale(200, 3000)
      .multiply(10)
      .rename("elevation");

    const modis = ee.ImageCollection("MODIS/061/MCD12Q1");
    const landcover = ee.Image(
      ee.Algorithms.If(
        modis.size().gt(0),
        modis.first().select("LC_Type1").clip(roi),
        ee.Image.constant(0)
      )
    )
      .remap(
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
        [2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 5, 3, 3, 3, 5]
      )
      .rename("landcover");

    console.log("\n🔍 Checking bands for all layers...");
    rainfall.bandNames().evaluate((b) => console.log("   🌧 Rainfall bands:", b));
    soil.bandNames().evaluate((b) => console.log("   🌱 Soil bands:", b));
    slope.bandNames().evaluate((b) => console.log("   🏔 Slope bands:", b));
    elevation.bandNames().evaluate((b) => console.log("   ⛰ Elevation bands:", b));
    landcover.bandNames().evaluate((b) => console.log("   🗺 Landcover bands:", b));


    const combined = safeAdd(
      safeAdd(safeAdd(rainfall, soil, "rainfall", "soil"), safeAdd(slope, elevation, "slope", "elevation")),
      landcover,
      "combined",
      "landcover"
    ).rename("flood_risk");

    
    const result = combined.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: roi,
      scale: 90,
      maxPixels: 1e9,
    });

    const floodData = await new Promise((resolve, reject) => {
      result.evaluate((data, err) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    if (!floodData) return res.status(404).json({ error: "No data found" });

    const index = Math.round(floodData.flood_risk || 0);
    let riskLevel = "Low";
    if (index > 60) riskLevel = "High";
    else if (index > 40) riskLevel = "Moderate";
    else if (index > 20) riskLevel = "Mild";

    console.log(`\n✅ Final Flood Index: ${index} (${riskLevel})`);

    res.json({
      location: { lat: latNum, lon: lonNum },
      floodRiskIndex: index,
      riskLevel,
      date: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: err.message });
  }
};
