const mongoose = require("mongoose");
const { Schema } = mongoose;

const locationTrackingSchema = new Schema({
    caseId: {
        type: String,
        required: true,
        index: true
    },
    case: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case',
        required: true
    },
    location: {
        type: String,
        required: true
    },
    coordinates: {
        latitude: {
            type: Number,
            required: false,
            min: -90,
            max: 90
        },
        longitude: {
            type: Number,
            required: false,
            min: -180,
            max: 180
        },
        accuracy: {
            type: Number, // Accuracy in meters
            default: null
        },
        source: {
            type: String,
            enum: ['gps', 'geojs', 'nominatim', 'manual', 'default', 'city_lookup'],
            default: 'manual'
        }
    },
    detectionSource: {
        type: String,
        enum: ['initial_report', 'face_recognition', 'cctv', 'manual_update', 'witness_report'],
        default: 'face_recognition'
    },
    confidence: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    detectionTime: {
        type: Date,
        default: Date.now
    },
    detectionDetails: {
        cameraId: String,
        imageUrl: String,
        matchAccuracy: Number, // Percentage accuracy for face recognition
        verificationStatus: {
            type: String,
            enum: ['pending', 'verified', 'false_positive'],
            default: 'pending'
        }
    },
    reportedBy: {
        type: String, // Could be 'system', 'admin', or user ID
        default: 'system'
    },
    additionalNotes: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for efficient querying by case
locationTrackingSchema.index({ caseId: 1, detectionTime: -1 });
locationTrackingSchema.index({ case: 1, detectionTime: -1 });

// Add method to get latest location for a case
locationTrackingSchema.statics.getLatestLocation = function(caseId) {
    return this.findOne({ caseId, isActive: true })
        .sort({ detectionTime: -1 })
        .exec();
};

// Add method to get location timeline for a case
locationTrackingSchema.statics.getLocationTimeline = function(caseId) {
    return this.find({ caseId, isActive: true })
        .sort({ detectionTime: -1 })
        .exec();
};

// Add method to update coordinates for a location
locationTrackingSchema.methods.updateCoordinates = function(coordinates) {
    if (coordinates && typeof coordinates.lat === 'number' && typeof coordinates.lng === 'number') {
        this.coordinates = {
            latitude: coordinates.lat,
            longitude: coordinates.lng,
            source: coordinates.source || 'manual',
            accuracy: coordinates.accuracy || null
        };
        return this.save();
    }
    return Promise.resolve(this);
};

module.exports = mongoose.model("LocationTracking", locationTrackingSchema);
