import { getGroupChat, getMessages , getUnreadChatCount, sendGroupMessage, sendMessage } from "../controllers/chat.controller.js";
import { Router } from "express";

const router = Router();

router.route("/:recipientId/messages").get(getMessages);
router.route("/:projectId/groupchat").get(getGroupChat);
router.route("/send").post(sendMessage);
router.route("/groupchat").post(sendGroupMessage);
router.route("/:projectId/getUnreadChatCount").get(getUnreadChatCount);

export default router;