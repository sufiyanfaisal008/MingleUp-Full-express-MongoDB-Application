import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: String,
        trim: true,
        default: ""
    },
    mediaUrl: {
        type: String,
        default: ""
    },
    messageType: {
        type: String,
        enum: ["text", "image", "video", "file"],
        default: "text"
    },
    readBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
}, { timestamps: true });

export const Message = mongoose.model("Message", messageSchema);