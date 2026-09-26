import mongoose from "mongoose";

const postschema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String, 
        required: true,
        trim: true
    },
    imageUrl: {
        type: String, 
        trim: true,
        default: null
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Nook-Users",
    },
    likes: {
        type: [mongoose.Schema.Types.ObjectId],
        default: [],
        ref: "users"
    },
    comments: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Nook-Users",
            required: true
        },
        comment: {
            type: String, 
            trim: true,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]

}, { timestamps: true })

export const postmodel = mongoose.model("Nook-Social", postschema)