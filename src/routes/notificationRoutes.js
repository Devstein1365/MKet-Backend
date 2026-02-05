// ===================================
// NOTIFICATION ROUTES
// ===================================
// All routes for notification operations
// Base path: /api/notifications
// ===================================

import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from "../controllers/notificationController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// All notification routes require authentication

// Get notifications
// GET /api/notifications?page=1&limit=20&unreadOnly=true
router.get("/", auth, getNotifications);

// Mark all as read
// PUT /api/notifications/read-all
router.put("/read-all", auth, markAllAsRead);

// Mark notification as read
// PUT /api/notifications/:id/read
router.put("/:id/read", auth, markAsRead);

// Delete notification
// DELETE /api/notifications/:id
router.delete("/:id", auth, deleteNotification);

// Clear all notifications
// DELETE /api/notifications
router.delete("/", auth, clearAllNotifications);

export default router;
