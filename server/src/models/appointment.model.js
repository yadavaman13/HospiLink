const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    // Unique appointment ID in format: APT_HOSP_001_20260509_1000
    appointmentId: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },

    // Core references
    hospitalId: {
        type: String,
        required: true,
        index: true
    },

    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    // Appointment details
    appointmentDate: {
        type: Date,
        required: true,
        index: true
    },

    timeSlot: {
        type: String, // "09:00", "09:30", "10:00" format (HH:MM)
        required: true
    },

    duration: {
        type: Number,
        default: 30 // minutes
    },

    appointmentType: {
        type: String,
        enum: ["consultation", "followup", "procedure"],
        default: "consultation"
    },

    reason: String, // e.g., "Chest pain", "Follow-up"
    notes: String,

    // Status tracking
    status: {
        type: String,
        enum: ["scheduled", "confirmed", "completed", "cancelled", "no_show"],
        default: "scheduled",
        index: true
    },

    cancelledBy: {
        type: String,
        enum: ["patient", "doctor", "system"],
        default: null
    },

    cancellationReason: String,
    cancelledAt: Date,

    // Financial
    consultationFee: Number,
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "refunded"],
        default: "pending"
    },

    // Snapshots (for history, in case doctor/patient details change)
    patientSnapshot: {
        name: String,
        age: Number,
        gender: String,
        phone: String,
        email: String
    },

    doctorSnapshot: {
        name: String,
        specialization: String,
        licenseNumber: String,
        email: String
    },

    // Timestamps
    bookedAt: {
        type: Date,
        default: Date.now
    },

    confirmedAt: Date,
    completedAt: Date,

    // Optimistic locking (prevents race conditions)
    version: {
        type: Number,
        default: 1
    },

    // Notification tracking
    bookingEmailSent: { type: Boolean, default: false },
    reminderEmailSent: { type: Boolean, default: false },
    reminderSentAt: Date,
    completionEmailSent: { type: Boolean, default: false },
    cancellationEmailSent: { type: Boolean, default: false },

    // Doctor feedback (after appointment)
    doctorNotes: String,
    prescriptions: [{
        medication: String,
        dosage: String,
        frequency: String,
        duration: String, // e.g., "7 days"
        instructions: String
    }],

    // AI analysis (if integrated with Gemini)
    aiAnalysis: {
        priorityScore: Number,
        priorityLevel: {
            type: String,
            enum: ["critical", "high", "medium", "low"]
        },
        reasoning: String,
        suspectedConditions: [String],
        recommendedSpecialist: String
    }

}, { timestamps: true });

// Index for finding appointments by doctor + date (common query)
appointmentSchema.index({ doctorId: 1, appointmentDate: 1, status: 1 });

// Index for finding appointments by patient
appointmentSchema.index({ patientId: 1, status: 1 });

// Index for finding available slots (date + not cancelled)
appointmentSchema.index({ appointmentDate: 1, status: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;