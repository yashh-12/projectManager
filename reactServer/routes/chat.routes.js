import { getMessages , sendMessage } from "../controllers/chat.controller.js";
import { Router } from "express";

const router = Router();

router.route("/:recipientId/messages").get(getMessages);
router.route("/send").post(sendMessage);

export default router;