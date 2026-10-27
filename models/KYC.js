import mongoose from "mongoose";

const KYCSchema = new mongoose.Schema(
    {
        userId: {
            type: Number,
            required: true,
        },

        username: {
            type: String,
        },

        platformName: {
            type: String,
            required: true,
        },

        fullName: {
            type: String,
            required: true,
        },

        idType: {
            type: String,
            required: true,
        },

        idNumber: {
            type: String,
            required: true,
        },

        selfieUrl: {
            type: String,
            required: true,
        },

        idFrontUrl: {
            type: String,
            required: true,
        },

        idBackUrl: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true
    }
);

export default mongoose.models.KYC ||
    mongoose.model("KYC", KYCSchema);