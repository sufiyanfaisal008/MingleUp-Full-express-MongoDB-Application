import express from 'express';
import { Chat } from '../../models/chats/chat.mjs';
import { Message } from '../../models/chats/message.mjs';
import mongoose from 'mongoose';

// Yeh line ensure karegi ke Mongoose mein "User" model register ho chuka hai
if (!mongoose.models.User) {
    // Agar aapka user schema yahan available hai toh theek, warna ye blank schema error rok lega
    const userSchema = new mongoose.Schema({ name: String, email: String, password: String });
    mongoose.model('User', userSchema);
}
const chatRouter = (io) => {
    const router = express.Router();

    router.get('/messages/:chatId', async (req, res) => {
    try {
        const { chatId } = req.params;
        const messages = await Message.find({ chatId })
            .populate("senderId", "name email profileImage profilePic avatar") // Sender ka name aur DP populate ki
            .sort({ createdAt: 1 });

        return res.send({ message: "Messages fetched successfully", data: messages });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal server error" });
    }
});

   router.post('/chat/create', async (req, res) => {
    try {
        const { userId, recipientId, isGroupChat, groupName } = req.body;
        const currentUserId = req.user?._id || userId; 

        if (!currentUserId || !recipientId) {
            return res.status(400).send({ message: "Both currentUserId and recipientId are required" });
        }

        if (isGroupChat) {
            if (!groupName || !recipientId || recipientId.length === 0) {
                return res.status(400).send({ message: "Group name and members are required" });
            }
            const chat = await Chat.create({
                participants: [currentUserId, ...recipientId],
                isGroupChat: true,
                groupName,
                groupAdmin: currentUserId
            });
            const fullChat = await Chat.findById(chat._id).populate("participants", "-password");
            return res.status(201).send({ message: "Group chat created successfully", data: fullChat });
        }

        // Check if chat already exists between these two users
        let existingChat = await Chat.findOne({
            isGroupChat: false,
            participants: { $all: [currentUserId, recipientId], $size: 2 }
        }).populate("participants", "-password");

        if (existingChat) {
            return res.send({ message: "Chat already exists", data: existingChat });
        }

        const newChat = await Chat.create({
            participants: [currentUserId, recipientId],
            isGroupChat: false
        });

        const fullNewChat = await Chat.findById(newChat._id).populate("participants", "-password");
        return res.status(201).send({ message: "Chat created successfully", data: fullNewChat });

    } catch (error) {
        console.error("DETAILED CHAT CREATE ERROR:", error);
        return res.status(500).send({ message: "Internal server error", error: error.message });
    }
});

    router.get('/chats', async (req, res) => {
        try {
            const currentUserId = req.user?._id || req.query.userId;
            const chats = await Chat.find({ participants: { $in: [currentUserId] } })
                .populate("participants", "-password")
                .populate("lastMessage.sender", "-password")
                .sort({ updatedAt: -1 });

            return res.send({ message: "Chats fetched successfully", data: chats });
        } catch (error) {
            console.error(error);
            return res.status(500).send({ message: "Internal server error" });
        }
    });

    router.get('/messages/:chatId', async (req, res) => {
        try {
            const { chatId } = req.params;
            const messages = await Message.find({ chatId })
                .populate("senderId", "-password")
                .sort({ createdAt: 1 });

            return res.send({ message: "Messages fetched successfully", data: messages });
        } catch (error) {
            console.error(error);
            return res.status(500).send({ message: "Internal server error" });
        }
    });

    router.post('/message/send', async (req, res) => {
        try {
            const { chatId, senderId, message, mediaUrl, messageType } = req.body;

            if (!chatId || !senderId) {
                return res.status(400).send({ message: "Chat ID and Sender ID are required" });
            }

            const newMessage = await Message.create({
                chatId,
                senderId,
                message: message || "",
                mediaUrl: mediaUrl || "",
                messageType: messageType || "text",
                readBy: [senderId]
            });

            const updatedChat = await Chat.findByIdAndUpdate(
                chatId,
                {
                    lastMessage: {
                        text: message || (messageType === 'image' ? '📷 Image' : '📎 Attachment'),
                        sender: senderId,
                        createdAt: new Date()
                    }
                },
                { new: true }
            );

            const fullMessage = await Message.findById(newMessage._id).populate("senderId", "-password");

            if (io) {
                io.to(chatId).emit("receive_message", fullMessage);
            }

            return res.status(201).send({ message: "Message sent successfully", data: fullMessage });
        } catch (error) {
            console.error(error);
            return res.status(500).send({ message: "Internal server error" });
        }
    });

    return router;
};

export default chatRouter;