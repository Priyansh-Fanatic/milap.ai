require('dotenv').config();
const connectToMongo = require('./db');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000;

connectToMongo();

// Configure body parser with increased limits for file uploads
app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors());

// Register your authentication routes here:
app.use("/api/auth", require("./routes/auth"));

// Register your other routes
app.use("/api/missingpeople", require("./routes/missing"));
app.use("/api/missing", require("./routes/missing")); // Add this for admin compatibility
app.use("/api/foundlocation", require("./routes/location"));
app.use("/api/admin", require("./routes/adminAuth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/node", require("./routes/node"));
app.use("/api/cases", require("./routes/cases"));
app.use("/api/prelocation", require("./routes/prelocation"));


app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
});
