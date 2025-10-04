const mongoose = require("mongoose");
const { Schema } = mongoose;

const personSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        // required: true, // Uncomment if you want to enforce email requirement
    },
    date: {
        type: Date,
        default: Date.now
    },
    gender: { // Changed to lowercase for consistency
        type: String
    },
    identification: {
        type: String
    },
    nationality: {
        type: String
    },
    height: {
        type: mongoose.Schema.Types.Decimal128 // Correctly defined as Decimal128
    },
    date_missing: { // Changed to lowercase for consistency
        type: Date
    },
    incident_place: {
        type: String,
    },
    incident_time: {
        type: String,
    },
    address: {
        type: String,
    },
    adhaar_number: {
        type: String,
        unique: true,
        required: true // Consider making this required if it's essential
    },
    image: {
        data: Buffer, // Consider changing this if you use cloud storage
        contentType: String
    },
    phonenumber: {
        type: String
    },
    casenumber: {
        type: String,
        required: false
    },
    submittedby: {
        type: String,
        required: false
    }
});

const Person = mongoose.model("peoples", personSchema); // Capitalize 'Person'

module.exports = Person; // Export the model
