const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({

    hospitalId: {
        type: String,
        required: true,
        index: true
    },

    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Snapshot (important for history)
    patientSnapshot: {
        name: String,
        age: Number,
        gender: String,
        phone: String
    },

    doctorSnapshot: {
        name: String,
        specialization: String
    },

    appointmentDate: {
        type: Date,
        required: true
    },

    appointmentTime: {
        type: String, // "14:30"
        required: true
    },

    symptoms: {
        type: String,
        required: true
    },

    // 🔥 AI BLOCK (VERY IMPORTANT)
    aiAnalysis: {
        priorityScore: {
            type: Number,
            default: 0
        },

        priorityLevel: {
            type: String,
            enum: ["critical", "high", "medium", "low"]
        },

        reasoning: String,

        suspectedConditions: [String],

        recommendedSpecialist: String
    },

    status: {
        type: String,
        enum: ["pending", "confirmed", "completed", "cancelled", "no_show"],
        default: "pending"
    },

    doctorNotes: String,

    cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    cancellationReason: String

}, { timestamps: true });


const appointmentModel = mongoose.model("Appointment", appointmentSchema);

module.exports = appointmentModel;