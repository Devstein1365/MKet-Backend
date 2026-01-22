import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from "../controller/notificationController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All notification routes are protected
router.get("/", protect, getNotifications);
router.put("/read-all", protect, markAllAsRead);
router.put("/:id/read", protect, markAsRead);
router.delete("/:id", protect, deleteNotification);
router.delete("/", protect, clearAllNotifications);

export default router;
