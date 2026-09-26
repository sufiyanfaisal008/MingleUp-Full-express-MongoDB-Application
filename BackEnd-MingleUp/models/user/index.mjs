import mongoose from "mongoose";
import { emailPattern } from "../../utilities/core.mjs";

const usersSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        trim: true
    },

    lastname: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        match: emailPattern,
    },

    isEmailverified: {
        type: Boolean,
        default: false
    },

    password: {
        type: String,
        required: true,
        trim: true,
    },

    profilePicture: {
        type: String,
        trim: true,
        default: null,
    }

}, { timestamps: true })

export const UserModel = mongoose.model("Nook-Users", usersSchema)