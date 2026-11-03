import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    ],
    lastMessage: {
        text: { type: String, default: "" },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date }
    },
    isGroupChat: {
        type: Boolean,
        default: false
    },
    groupName: {
        type: String,
        trim: true,
        default: ""
    },
    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

export const Chat = mongoose.model("Chat", chatSchema);