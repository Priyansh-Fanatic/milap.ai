const express = require("express");
const router = express.Router();

// Temporary storage for location data
let preLocationData = { latitude: null, longitude: null };

// 📍 POST - Save pre-location data
router.post("/", (req, res) => {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
        return res.status(400).json({ error: "Missing latitude or longitude" });
    }

    preLocationData = { latitude, longitude }; // Store location
    console.log("📍 Pre-location received:", preLocationData);

    res.status(200).json({ message: "Pre-location saved successfully", data: preLocationData });
});

// 🌍 GET - Retrieve pre-location data
router.get("/", (req, res) => {
    if (!preLocationData.latitude || !preLocationData.longitude) {
        return res.status(404).json({ error: "No pre-location data available" });
    }

    res.json(preLocationData);
});

module.exports = router;
