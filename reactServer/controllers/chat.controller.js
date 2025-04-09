import asyncHandler from "../utils/asyncHandler.js";
import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";

const sendMessage = asyncHandler(async (req, res) => {

    const { recipientId, message } = req.body;
    console.log(req.body);
    
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
        message
    });

    if (!chat) {
        throw new apiError(500, "Failed to send message");
    }

    return res.status(201).json(new apiResponse(201, chat, "Message sent successfully"));

})

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
    if (!messages) {
        throw new apiError(500, "Failed to retrieve messages");
    }
    return res.status(200).json(new apiResponse(200, messages, "Messages retrieved successfully"));
})

export { sendMessage, getMessages }