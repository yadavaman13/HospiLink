const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema({

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

    admissionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admission",
        default: null
    },

    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
        default: null
    },

    recordType: {
        type: String,
        enum: ["consultation", "diagnosis", "prescription", "test_report", "discharge_summary"],
        required: true
    },

    // 🔥 flexible content block
    content: {

        diagnosis: String,

        symptoms: String,

        medications: [
            {
                name: String,
                dosage: String,
                frequency: String,
                duration: String
            }
        ],

        testResults: {
            type: Map,
            of: String
        },

        doctorNotes: String,

        attachments: [
            {
                fileUrl: String,
                fileType: String, // pdf, image
                uploadedAt: Date
            }
        ]
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    visibility: {
        type: String,
        enum: ["private", "hospital", "cross_hospital"],
        default: "hospital"
    },

    isCritical: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

const medicalRecordModel = mongoose.model("MedicalRecord", medicalRecordSchema);

module.exports = medicalRecordModel;