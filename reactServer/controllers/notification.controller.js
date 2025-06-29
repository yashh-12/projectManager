import { isValidObjectId } from "mongoose";
import Notification from "../models/notification.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const createNotification = asyncHandler(async (req, res) => {
  const { userIds, message } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new apiError(400, "userIds must be a non-empty array");
  }

  if (!message) {
    throw new apiError(400, "Message is required");
  }

  const notifications = await Promise.all(
    userIds.map(userId =>
      Notification.create({ userId, message })
    )
  );

  if (!notifications || notifications.length === 0) {
    throw new apiError(400, "Failed to create notifications");
  }

  return res
    .status(200)
    .json(new apiResponse(200, notifications, "Notifications created successfully"));
});


const notificationMarkAsRead = asyncHandler(async (req, res) => {
  const { notifications } = req.body;

  if (!Array.isArray(notifications) || notifications.length === 0) {
    throw new apiError(400, "Notification IDs are required");
  }

  const updated = await Notification.updateMany(
    { _id: { $in: notifications } },
    { $set: { status: "read" } }
  );

  return res.status(200).json(
    new apiResponse(200, updated, "Notifications marked as read")
  );
});

const getAllReadNotification = asyncHandler(async (req, res) => {
  const userId = req?.user?._id

  if (!userId)
    throw new apiError(400, "not authorized")

  const notifications = await Notification.find({
    $and: [{ userId: userId }, { status: "read" }]
  })

  if (!notifications)
    throw new apiError(400, "Not able to fetch Notification")


  return res.status(200).json(new apiResponse(200, notifications, "Notification fetched successfully"))

})


const getAllUnreadNotification = asyncHandler(async (req, res) => {
  const userId = req?.user?._id

  if (!userId)
    throw new apiError(400, "not authorized")

  const notifications = await Notification.find({
    $and: [{ userId: userId }, { status: "unread" }]
  })

  if (!notifications)
    throw new apiError(400, "Not able to fetch Notification")


  return res.status(200).json(new apiResponse(200, notifications, "Notification fetched successfully"))

})

const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  if (!isValidObjectId(notificationId))
    throw new apiError(400, "Invalid Notificationid")

  const notification = await Notification.findByIdAndDelete(notificationId)

  if (!notification)
    throw new apiError(400, "failed to fetch notification")

  return res.status(200).json(new apiResponse(200, notification, "Notification deleted successfully"))

})

const getUnreadNotificationCount = asyncHandler(async (req, res) => {
  const userId = req?.user?._id

  if (!userId)
    throw new apiError(400, "unauthorized")


  const unreadNotificationCount = await Notification.countDocuments({
    userId: userId,
    status: "unread"
  })

  return res.status(200).json(new apiResponse(200, unreadNotificationCount, "unread Notification count"))

})

const clearAllNotification = asyncHandler(async (req, res) => {
  const { notificationIds } = req.body;

  if (!(Array.isArray(notificationIds) && notificationIds > 0))
    throw new apiError(400, "no Notification Found")

  const clearedNotifications = await Promise.all(
    notificationIds.map(notificationId => Notification.findByIdAndDelete(notificationId))
  )

  if (!clearedNotifications)
    throw new apiError(404, "Failed to clear")

  return res.status(200).json(new apiResponse(200, clearedNotifications, "unread Notification count"))

})




export {
  createNotification,
  getAllUnreadNotification,
  getUnreadNotificationCount,
  deleteNotification,
  clearAllNotification,
  notificationMarkAsRead,
  getAllReadNotification
}