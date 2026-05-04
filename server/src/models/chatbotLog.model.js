const mongoose = require("mongoose");

const chatbotLogSchema = new mongoose.Schema({

    hospitalId: {
        type: String,
        index: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    query: {
        type: String,
        required: true
    },

    response: {
        type: String
    },

    aiModel: {
        type: String,
        default: "gemini"
    },

    tokensUsed: Number

}, { timestamps: true });

const chatbotLogModel = mongoose.model("ChatbotLog", chatbotLogSchema);

module.exports = chatbotLogModel;