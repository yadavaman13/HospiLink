const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({

    hospitalId: {
        type: String,
        index: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    action: {
        type: String,
        required: true
        // e.g. "LOGIN", "BOOK_APPOINTMENT", "ASSIGN_BED"
    },

    entityType: {
        type: String
        // "appointment", "admission", "bed", etc.
    },

    entityId: {
        type: mongoose.Schema.Types.ObjectId
    },

    metadata: {
        type: mongoose.Schema.Types.Mixed
        // flexible details
    },

    ipAddress: String,
    userAgent: String

}, { timestamps: true });

const activityLogModel = mongoose.model("ActivityLog", activityLogSchema);

module.exports = activityLogModel;