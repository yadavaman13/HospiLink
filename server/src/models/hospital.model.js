const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema({

    hospitalId: {
        type: String,
        required: true,
        unique: true // e.g. HOSP_001
    },

    name: {
        type: String,
        required: true
    },

    address: {
        street: String,
        city: String,
        state: String,
        zip: String
    },

    contact: {
        phone: String,
        email: String,
        website: String
    },

    logoUrl: String,

    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    status: {
        type: String,
        enum: ["pending", "active", "suspended"],
        default: "pending"
    },

    reviewStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },

    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    reviewedAt: {
        type: Date,
        default: null
    },

    reviewNotes: {
        type: String,
        default: null
    },

    subscription: {
        plan: {
            type: String,
            enum: ["basic", "premium"],
            default: "basic"
        },
        startDate: Date,
        endDate: Date
    },

    departments: [
        {
            name: String,
            description: String
        }
    ],

    settings: {
        allowCrossHospitalAccess: {
            type: Boolean,
            default: false
        },
        enableAI: {
            type: Boolean,
            default: true
        }
    }

}, { timestamps: true });


const hospitalModel = mongoose.model("Hospital", hospitalSchema);

module.exports = hospitalModel;