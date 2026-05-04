const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true,
        index: true
    },

    otp: {
        type: String,
        required: true
    },

    purpose: {
        type: String,
        enum: ["register", "login", "reset_password"],
        required: true
    },

    expiresAt: {
        type: Date,
        required: true
    },

    isUsed: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });


// 🔥 Auto delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const otpModel = mongoose.model("OTP", otpSchema);

module.exports = otpModel;