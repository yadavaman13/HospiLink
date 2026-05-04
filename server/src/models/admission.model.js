const mongoose = require("mongoose");

const treatmentSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["medicine", "iv", "procedure", "test"],
        required: true
    },

    name: String, // medicine/test name

    dosage: String,
    frequency: String,
    route: String,

    startDate: Date,
    endDate: Date,

    prescribedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    status: {
        type: String,
        enum: ["active", "completed", "discontinued"],
        default: "active"
    },

    // 🔥 logs for tracking
    administrationLogs: [
        {
            givenAt: Date,
            givenBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            doseGiven: String,
            notes: String
        }
    ]

}, { _id: true });


const admissionSchema = new mongoose.Schema({

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
        ref: "User"
    },

    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment"
    },

    bedId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bed"
    },

    // 🔥 QR SYSTEM
    qrToken: {
        type: String,
        required: true,
        unique: true
    },

    admissionDate: {
        type: Date,
        default: Date.now
    },

    dischargeDate: Date,

    admissionReason: String,

    status: {
        type: String,
        enum: ["active", "discharged", "transferred"],
        default: "active"
    },

    // 🔥 embedded treatments
    treatments: [treatmentSchema],

    // 🔥 vitals tracking
    vitals: [
        {
            recordedAt: Date,
            recordedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            bp: String,
            pulse: String,
            temperature: String,
            spo2: String,
            respiratoryRate: String
        }
    ],

    notes: String

}, { timestamps: true });

module.exports = mongoose.model("Admission", admissionSchema);