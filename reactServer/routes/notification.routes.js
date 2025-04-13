import { Router, Router } from "express";
import { clearAllNotification, createNotification, deleteNotification, getAllUnreadNotification, getUnreadNotificationCount, notificationMarkAsRead } from "../controllers/notification.controller";

const router = Router()

router.route("/createNotification",createNotification)
router.route("/clearAllNotification",clearAllNotification)
router.route("/:notificationId/markasread",notificationMarkAsRead)
router.route("/:notificationId/delete",deleteNotification)
router.route("/getUnreadNotification",getAllUnreadNotification)
router.route("/getUnreadNotificationCount",getUnreadNotificationCount)

export default router