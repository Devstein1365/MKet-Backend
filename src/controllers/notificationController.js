// ===================================
// NOTIFICATION CONTROLLER
// ===================================
// Handles user notifications
// ===================================

import prisma from "../config/prisma.js";

// ===================================
// GET NOTIFICATIONS
// ===================================
// GET /api/notifications?page=1&limit=20&unreadOnly=true
// Requires: Authentication
export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = { userId: req.userId };
    if (unreadOnly === "true") {
      where.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: req.userId, isRead: false },
      }),
    ]);

    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load notifications",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// MARK NOTIFICATION AS READ
// ===================================
// PUT /api/notifications/:id/read
// Requires: Authentication
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    if (notification.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to access this notification",
      });
    }

    // Mark as read
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({
      success: true,
      message: "Notification marked as read",
      notification: updatedNotification,
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark as read",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// MARK ALL AS READ
// ===================================
// PUT /api/notifications/read-all
// Requires: Authentication
export const markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark all as read",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// DELETE NOTIFICATION
// ===================================
// DELETE /api/notifications/:id
// Requires: Authentication
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    if (notification.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this notification",
      });
    }

    await prisma.notification.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// CLEAR ALL NOTIFICATIONS
// ===================================
// DELETE /api/notifications
// Requires: Authentication
export const clearAllNotifications = async (req, res) => {
  try {
    await prisma.notification.deleteMany({
      where: { userId: req.userId },
    });

    res.json({
      success: true,
      message: "All notifications cleared",
    });
  } catch (error) {
    console.error("Clear all notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear notifications",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// HELPER FUNCTION: CREATE NOTIFICATION
// ===================================
// Used by other controllers and socket handlers
// to create notifications
export const createNotification = async ({
  userId,
  type,
  title,
  message,
  relatedId = null,
  relatedType = null,
}) => {
  try {
    // Check if user has notifications enabled
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        notificationsEnabled: true,
        messageNotifications: true,
        listingUpdates: true,
      },
    });

    if (!user || !user.notificationsEnabled) {
      return null; // User has disabled notifications
    }

    const normalizedType = String(type || "").toUpperCase();

    const listingUpdateTypes = new Set([
      "PRODUCT_SOLD",
      "PRODUCT_LIKED",
      "NEW_REVIEW",
      "PRICE_DROP",
      "LISTING_APPROVED",
      "LISTING_REPORTED",
    ]);

    if (normalizedType === "NEW_MESSAGE" && !user.messageNotifications) {
      return null;
    }

    if (listingUpdateTypes.has(normalizedType) && !user.listingUpdates) {
      return null;
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        relatedId,
        relatedType,
      },
    });

    return notification;
  } catch (error) {
    console.error("Create notification error:", error);
    return null;
  }
};
