const mongoose = require("mongoose");

const qrScanLogSchema = new mongoose.Schema({

    hospitalId: {
        type: String,
        required: true,
        index: true
    },

    qrToken: {
        type: String,
        required: true
    },

    admissionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admission"
    },

    scannedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    scanLocation: String, // ward, ICU, etc.

    deviceInfo: String

}, { timestamps: true });

const qrScanLogModel = mongoose.model("QRScanLog", qrScanLogSchema);

module.exports = qrScanLogModel;