const mongoose = require('mongoose');
require('dotenv').config();

// Always use environment variable - never hardcode credentials
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error("❌ MONGO_URI is not defined in .env file");
    console.error("Please create backend/.env file with MONGO_URI variable");
    process.exit(1);
}

const connectToMongo = async () => {
    try {
        // Set strictQuery to suppress deprecation warning
        mongoose.set('strictQuery', false);
        
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

module.exports = connectToMongo;
