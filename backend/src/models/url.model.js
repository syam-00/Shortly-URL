const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
    {
        originalUrl: {
            type: String,
            required: true
        },

        shortCode: {
            type: String,
            required: true,
            unique: true
        },

        customCode: {
            type: String,
            default: null
        },

        expiresAt: {
            type: Date,
            default: null,
            expires: 0 // This will be set dynamically when creating a new URL
        },

        clicks: {
            type: Number,
            default: 0
        }

    },
    {
        timestamps: true
    }
);

const Url = mongoose.model("Url", urlSchema);

module.exports = Url;