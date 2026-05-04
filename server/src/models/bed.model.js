const mongoose = require("mongoose");

const bedSchema = new mongoose.Schema({

    hospitalId: {
        type: String,
        required: true,
        index: true
    },

    ward: {
        name: {
            type: String, // e.g. ICU Ward
            required: true
        },
        type: {
            type: String,
            enum: ["ICU", "General", "Private", "Emergency", "Pediatric", "Maternity"],
            required: true
        }
    },

    bedNumber: {
        type: String, // e.g. ICU-101
        required: true
    },

    floor: String,

    status: {
        type: String,
        enum: ["available", "occupied", "maintenance", "cleaning", "reserved"],
        default: "available"
    },

    currentPatientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    currentAdmissionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admission",
        default: null
    },

    lastAssignedAt: Date,

    notes: String

}, { timestamps: true });


// 🔥 Ensure unique bed per hospital
bedSchema.index({ hospitalId: 1, bedNumber: 1 }, { unique: true });

module.exports = mongoose.model("Bed", bedSchema);