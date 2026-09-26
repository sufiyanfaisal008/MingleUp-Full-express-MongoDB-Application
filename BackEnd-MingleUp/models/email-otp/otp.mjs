import mongoose from "mongoose";

const emailOtpschema = new mongoose.Schema({
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

export const EmailOtp = mongoose.model("Nook-email-otp", emailOtpschema)