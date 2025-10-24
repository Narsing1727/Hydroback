const ee = require("@google/earthengine");

exports.riskZoning = async (req, res) => {
  try {
    console.log("📩 Risk zoning request received:", req.body);


    const { startDate, endDate, lat, lon } = req.body;
    const start = ee.Date(startDate || "2025-08-15");
    const end = ee.Date(endDate || "2025-08-16");
    const horizonDays = 3;

  
    const roi = ee.Geometry.Point([lon || 79.1, lat || 30.3]).buffer(10000);


    const chirps = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY");
    const smap = ee.ImageCollection("NASA/SMAP/SPL4SMGP/007").select("sm_surface");
    const s1 = ee
      .ImageCollection("COPERNICUS/S1_GRD")
      .filter(ee.Filter.listContains("transmitterReceiverPolarisation", "VV"))
      .filter(ee.Filter.eq("instrumentMode", "IW"))
      .select("VV");
    const srtm = ee.Image("USGS/SRTMGL1_003").select("elevation");
    const slope = ee.Terrain.slope(srtm);
    const lc = ee.ImageCollection("MODIS/061/MCD12Q1").first().select("LC_Type1");

   
    chirps.filterBounds(roi).size().evaluate(s => console.log("🌧 CHIRPS images:", s));
    smap.filterBounds(roi).size().evaluate(s => console.log("🌱 SMAP images:", s));
    s1.filterBounds(roi).size().evaluate(s => console.log("📡 Sentinel-1 images:", s));

   
    const r1 = chirps.filterDate(start.advance(-1, "day"), end).sum().rename("rain_1d");
    const r3 = chirps.filterDate(start.advance(-3, "day"), end).sum().rename("rain_3d");
    const r7 = chirps.filterDate(start.advance(-7, "day"), end).sum().rename("rain_7d");
    const soil = smap.filterDate(start.advance(-7, "day"), end).median().rename("soil");

    const current = s1.filterDate(start.advance(-3, "day"), end).median().rename("s1_cur");
    const baseline = s1
      .filterDate(start.advance(-30, "day"), start.advance(-25, "day"))
      .median()
      .rename("base");
    const future = s1.filterDate(end, end.advance(horizonDays, "day")).median().rename("fut");

    
    const label = ee.Image(ee.Algorithms.If(
      future,
      future.subtract(baseline).lt(-3),
      ee.Image(0)
    )).rename("label");

    const featureImage = ee
      .Image.cat([
        r1,
        r3,
        r7,
        soil,
        current,
        slope.rename("slope"),
        srtm.rename("elev"),
        lc.rename("lc"),
        label,
      ])
      .clip(roi);

   
    const rainStats = chirps
      .filterBounds(roi)
      .filterDate(start.advance(-7, "day"), end)
      .reduce(ee.Reducer.percentile([5, 95]))
      .select(["precipitation_p5", "precipitation_p95"]);

    const rainRegionStats = rainStats.reduceRegion({
      reducer: ee.Reducer.minMax(),
      geometry: roi,
      scale: 5000,
      maxPixels: 1e9,
    });

    const rainMin = ee.Number(
      ee.Algorithms.If(
        rainRegionStats.contains("precipitation_p5_min"),
        rainRegionStats.get("precipitation_p5_min"),
        0
      )
    );

    const rainMax = ee.Number(
      ee.Algorithms.If(
        rainRegionStats.contains("precipitation_p95_max"),
        rainRegionStats.get("precipitation_p95_max"),
        300
      )
    );

  
    const baseVis = srtm
      .visualize({
        min: 0,
        max: 3000,
        palette: ["#f9f9f9", "#c8c8c8", "#888888", "#4d4d4d", "#000000"],
      })
      .clip(roi);

    const rainVis = featureImage
      .select("rain_3d")
      .visualize({
        min: rainMin,
        max: rainMax,
        palette: ["white", "blue", "darkblue"],
        opacity: 0.6,
      })
      .clip(roi);

    const floodVis = featureImage
      .select("label")
      .visualize({
        min: 0,
        max: 1,
        palette: ["white", "red"],
        opacity: 0.6,
      })
      .clip(roi);

 
    const finalVis = ee.ImageCollection([baseVis, rainVis, floodVis]).mosaic();

   
    finalVis.getMap({}, (mapInfo, err) => {
      if (err) {
        console.error("❌ Map creation failed:", err);
        return res.status(500).json({ error: "Map creation failed", details: err });
      }

      const tileUrl =
        mapInfo.urlFormat ||
        `https://earthengine.googleapis.com/v1/projects/earthengine-legacy/maps/${mapInfo.mapid}/tiles/{z}/{x}/{y}`;

      console.log("✅ Risk zoning map ready:", tileUrl);

      res.status(200).json({
        status: "success",
        tileUrl,
        mapid: mapInfo.mapid,
        token: mapInfo.token || "",
        region: { lat: lat || 30.3, lon: lon || 79.1 },
        dates: { startDate, endDate },
      });
    });
  } catch (error) {
    console.error("❌ Error in risk zoning controller:", error);
    res.status(500).json({ error: error.message });
  }
};
