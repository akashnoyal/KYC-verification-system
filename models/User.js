import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    kyc_status: {
        type: String,
        enum: ["not_submitted", "pending", "approved", "rejected"],
        default: "not_submitted",
    },
}, { timestamps: true, strict: false });

export const User = mongoose.models.User || mongoose.model("User", userSchema);