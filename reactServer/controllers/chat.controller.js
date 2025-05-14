import asyncHandler from "../utils/asyncHandler.js";
import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";

// Send private message
const sendMessage = asyncHandler(async (req, res) => {
    const { recipientId, message, projectId } = req.body;

    if (!recipientId || !message) {
        throw new apiError(400, "Recipient ID and message are required");
    }

    const sender = req.user;
    const recipient = await User.findById(recipientId);

    if (!recipient) {
        throw new apiError(404, "User not found");
    }

    const chat = await Chat.create({
        sender: sender._id,
        recipient: recipient._id,
        message,
        projectId
    });

    if (!chat) {
        throw new apiError(500, "Failed to send message");
    }

    return res.status(201).json(new apiResponse(201, chat, "Message sent successfully"));
});

// Get chat messages between two users
const getMessages = asyncHandler(async (req, res) => {
    const { recipientId } = req.params;

    if (!recipientId) {
        throw new apiError(400, "Recipient ID is required");
    }

    const sender = req.user;
    const recipient = await User.findById(recipientId);

    if (!recipient) {
        throw new apiError(404, "User not found");
    }

    const messages = await Chat.find({
        $or: [
            { sender: sender._id, recipient: recipient._id },
            { sender: recipient._id, recipient: sender._id }
        ]
    }).sort({ createdAt: 1 });

    // Mark messages as read
    await Chat.updateMany(
        { recipient: sender._id, sender: recipient._id, status: "unread" },
        { $set: { status: "read" } }
    );

    return res.status(200).json(new apiResponse(200, messages, "Messages retrieved successfully"));
});

// Get count of unread messages for a project
const getUnreadChatCount = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const unreadChatCount = await Chat.countDocuments({
        status: "unread",
        projectId,
        recipient: req.user._id
    });

    return res.status(200).json(
        new apiResponse(200, unreadChatCount || 0, "Unread message count retrieved successfully")
    );
});

// Mark single chat as read
const markChatAsRead = asyncHandler(async (req, res) => {
    const { chatId } = req.params;

    if (!chatId) {
        throw new apiError(400, "Chat ID is required");
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
        throw new apiError(404, "Invalid chat ID");
    }

    if (chat.recipient.equals(req.user._id) && chat.status === "unread") {
        chat.status = "read";
        await chat.save();
    }

    return res.status(200).json(new apiResponse(200, chat, "Marked as read"));
});

export {
    sendMessage,
    getMessages,
    getUnreadChatCount,
    markChatAsRead
};
