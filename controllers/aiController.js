const axios = require("axios");
require("dotenv").config();

exports.chatWithAI = async (req, res) => {
  try {
    const { message, location } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        reply: "Please provide a message for Hydro AI.",
      });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    // ✅ Build location context if available
    let locationContext = "";
    if (location?.lat && location?.lng) {
      locationContext = `The user is currently located near ${location.name || "an unspecified area"} 
      (Latitude: ${location.lat}, Longitude: ${location.lng}). 
      Provide region-specific insights about rainfall, flood risk, and ecosystem conditions.`;
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You are Hydro AI — an advanced geospatial intelligence assistant that combines hydrology, rainfall analysis, and flood prediction. " +
              "Always integrate real-world reasoning based on user’s location if provided.",
          },
          {
            role: "user",
            content: `${locationContext}\n\nUser Query: ${message}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply =
      response.data?.choices?.[0]?.message?.content ||
      "No response from Hydro AI.";

    res.json({ success: true, reply });
  } catch (error) {
    console.error("Groq AI Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      reply: "⚠️ Hydro AI could not process your request. Try again later.",
    });
  }
};
