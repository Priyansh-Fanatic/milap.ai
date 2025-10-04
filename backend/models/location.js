const mongoose = require("mongoose");
const { Schema } = mongoose;

const locationSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    adhaar_number: {
        type: String
    },
    continent_code: { type: String },
    region: { type: String },
    latitude: { type: String },
    longitude: { type: String },
    ip: { type: String },
    city: { type: String },
    timezone: { type: String },
    organization_name: { type: String },
    country: { type: String },
    asn: { 
        type: Number,
        default: 0 
    },
    organization: { type: String },
    area_code: { type: String },
    accuracy: { 
        type: Number,
        default: 0
    },
    country_code3: { type: String },
    country_code: { type: String }
});

// Create indexes
locationSchema.index({ adhaar_number: 1 }); // Index for adhaar_number
locationSchema.index({ date: -1 });         // Index for date (descending order)
locationSchema.index({ city: 1, country: 1 }); // Compound index for city and country

const Location = mongoose.model("locations", locationSchema);

module.exports = Location;
