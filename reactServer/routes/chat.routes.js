import { getMessages, getUnreadChatCount, markChatAsRead, sendMessage } from "../controllers/chat.controller.js";
import { Router } from "express";

const router = Router();

// Get messages between sender and recipient
router.route("/:recipientId/messages").get(getMessages);

// Send a message
router.route("/send").post(sendMessage);

// Get unread chat count for a project
router.route("/:projectId/getUnreadChatCount").get(getUnreadChatCount);

// Mark a chat as read
router.route("/:chatId/markasread").put(markChatAsRead);

export default router;
