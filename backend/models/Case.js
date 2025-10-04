const mongoose = require("mongoose");
const { Schema } = mongoose;

const caseSchema = new Schema({
    caseId: {
        type: String,
        unique: true,
        default: function() {
            // This will be overwritten by the pre-save hook, but ensures a field exists
            return '';
        }
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reportedByUsername: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Other']
    },
    dateReported: {
        type: Date,
        default: Date.now
    },
    dateMissing: {
        type: Date,
        required: true
    },
    lastSeenLocation: {
        type: String,
        required: true
    },
    incidentTime: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    adhaarNumber: {
        type: String,
        required: true
    },
    height: {
        type: String
    },
    weight: {
        type: String
    },
    distinguishingMarks: {
        type: String
    },
    image: {
        type: String, // Base64 encoded image
        required: true
    },
    firReport: {
        type: String, // Base64 encoded FIR report
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'resolved'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    approvedAt: {
        type: Date
    },
    rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    rejectedAt: {
        type: Date
    },
    rejectionReason: {
        type: String
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    resolvedAt: {
        type: Date
    },
    resolutionReason: {
        type: String
    },
    foundLocation: {
        type: String
    },
    foundDate: {
        type: Date
    },
    resolutionRequested: {
        type: Boolean,
        default: false
    },
    resolutionRequestDate: {
        type: Date
    },
    resolutionRequestReason: {
        type: String
    },
    requestedFoundLocation: {
        type: String
    },
    requestedFoundDate: {
        type: Date
    },
    node: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Node'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    notes: [{
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin'
        },
        note: String,
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    updates: [{
        status: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin'
        },
        updatedAt: {
            type: Date,
            default: Date.now
        },
        description: String
    }]
}, {
    timestamps: true
});

// Generate case ID before saving
caseSchema.pre('save', async function(next) {
    try {
        if (!this.caseId || this.caseId === '') {
            const year = new Date().getFullYear();
            const month = String(new Date().getMonth() + 1).padStart(2, '0');
            
            // Count documents for this month
            const startOfMonth = new Date(year, new Date().getMonth(), 1);
            const startOfNextMonth = new Date(year, new Date().getMonth() + 1, 1);
            
            const count = await this.constructor.countDocuments({
                createdAt: {
                    $gte: startOfMonth,
                    $lt: startOfNextMonth
                }
            });
            
            this.caseId = `CASE-${year}${month}-${String(count + 1).padStart(4, '0')}`;
            console.log('Generated caseId:', this.caseId);
        }
        next();
    } catch (error) {
        console.error('Error in pre-save hook:', error);
        next(error);
    }
});

module.exports = mongoose.model("Case", caseSchema);
