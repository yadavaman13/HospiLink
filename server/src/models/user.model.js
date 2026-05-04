const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    hospitalId: {
        type: String,
        default: null, // null for super_admin
        index: true
    },

    role: {
        type: String,
        enum: ["super_admin", "hospital_admin", "doctor", "staff", "patient"],
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },

    profile: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },

        phone: { type: String, required: true },

        gender: {
            type: String,
            enum: ["male", "female", "other"],
            required: true
        },

        age: Number,
        bloodGroup: String,
        address: String,

        // Doctor specific
        specialization: String,
        department: String,
        licenseNumber: String
    },

    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },

    lastLogin: Date

}, { timestamps: true });


const userModel = mongoose.model("User", userSchema);

module.exports = userModel;