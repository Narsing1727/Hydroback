const express = require("express");
const cors = require("cors");
const floodRouter = require("./routes/floodRoutes");
const cookie = require("cookie-parser");
const app = express();
const dbConnect = require('./databases/db');
const authRouter = require('./routes/authRoutes');
const postRouter = require("./routes/postRoutes");
const feedRouter = require("./routes/feedRoutes");
const aIRouter = require("./routes/aIRoutes");
const riskRouter = require("./routes/riskRoutes");
const PORT = process.env.PORT || 5000;
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(cookie());
app.use(
  cors({
    origin: "https://hydrosphere-2.vercel.app/", 
    credentials: true, 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.get("/", (req, res) => {
  res.send("🌊 Hydroback server deployed successfully on Railway!");
});

app.use("/api/v1/hydrosphere", floodRouter);
app.use("/api/v1/hydrosphere/auth" , authRouter);
app.use("/api/v1/hydrosphere/post" , postRouter);
app.use("/api/v1/hydrosphere/feedback", feedRouter);
app.use("/uploads" , express.static("uploads"));
app.use("/api/v1/hydrosphere/ai",aIRouter );
app.use("/api/v1/hydrosphere/risk" , riskRouter)
dbConnect();
app.listen(PORT, "0.0.0.0" , () =>
  console.log("🌐 Backend running on http://localhost:5000")
);
