import mongoose from "mongoose";

const forgotOtpschema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true
       },
    otphashcode: {
        type: String,
        required: true,
       }

}, { timestamps: true })

export const forgotOtp = mongoose.model("Nook-forgot-otp", forgotOtpschema)