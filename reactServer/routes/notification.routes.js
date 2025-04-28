import { Router } from "express";
import { clearAllNotification, createNotification, deleteNotification, getAllUnreadNotification, getUnreadNotificationCount, notificationMarkAsRead } from "../controllers/notification.controller.js";

const router = Router()

router.route("/createNotification").post(createNotification)
router.route("/clearAllNotification").delete(clearAllNotification)
router.route("/markasread").post(notificationMarkAsRead)
router.route("/:notificationId/delete").delete(deleteNotification)
router.route("/getUnreadNotification").get(getAllUnreadNotification)
router.route("/getUnreadNotificationCount").get(getUnreadNotificationCount)

export default router