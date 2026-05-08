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
        enum: ["active", "inactive", "on_leave"],
        default: "active"
    },

    // Doctor-specific extended profile (only populated for role='doctor')
    doctorProfile: {
        yearsOfExperience: Number,
        consultationDuration: {
            type: Number,
            default: 30 // minutes
        },
        consultationFee: Number,
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        bio: String,

        // Weekly availability: which days/hours doctor works
        weeklySchedule: {
            monday: {
                start: String,    // "09:00"
                end: String,      // "18:00"
                available: { type: Boolean, default: true }
            },
            tuesday: {
                start: String,
                end: String,
                available: { type: Boolean, default: true }
            },
            wednesday: {
                start: String,
                end: String,
                available: { type: Boolean, default: true }
            },
            thursday: {
                start: String,
                end: String,
                available: { type: Boolean, default: true }
            },
            friday: {
                start: String,
                end: String,
                available: { type: Boolean, default: true }
            },
            saturday: {
                start: String,
                end: String,
                available: { type: Boolean, default: false }
            },
            sunday: {
                start: String,
                end: String,
                available: { type: Boolean, default: false }
            }
        },

        // Blocked date ranges (vacation, conference, medical leave)
        blockedDates: [{
            startDate: Date,
            endDate: Date,
            reason: {
                type: String,
                enum: ["vacation", "conference", "medical_leave", "emergency", "other"],
                default: "other"
            },
            autoCancel: { type: Boolean, default: true }
        }],

        // Real-time break status
        onBreak: {
            isOnBreak: { type: Boolean, default: false },
            breakStart: Date,
            breakEnd: Date,
            reason: {
                type: String,
                enum: ["lunch", "meeting", "emergency", "other"],
                default: "other"
            }
        },

        // Tracking
        appointmentCount: { type: Number, default: 0 },
        slotsCacheExpiry: Date // For slot caching
    },

    lastLogin: Date

}, { timestamps: true });


const userModel = mongoose.model("User", userSchema);

module.exports = userModel;