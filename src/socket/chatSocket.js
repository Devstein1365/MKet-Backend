// ===================================
// SOCKET.IO CHAT HANDLER
// ===================================
// Handles real-time chat functionality
// ===================================

import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { createNotification } from "../controllers/notificationController.js";

// Store online users as userId -> Set<socketId>
const onlineUsers = new Map();

const addUserSocket = (userId, socketId) => {
  const existing = onlineUsers.get(userId) || new Set();
  existing.add(socketId);
  onlineUsers.set(userId, existing);
  return existing.size;
};

const removeUserSocket = (userId, socketId) => {
  const existing = onlineUsers.get(userId);
  if (!existing) return 0;

  existing.delete(socketId);
  if (existing.size === 0) {
    onlineUsers.delete(userId);
    return 0;
  }

  onlineUsers.set(userId, existing);
  return existing.size;
};

const isUserOnline = (userId) => {
  const sockets = onlineUsers.get(userId);
  return Boolean(sockets && sockets.size > 0);
};

// ===================================
// SETUP SOCKET.IO
// ===================================
export const setupSocket = (io) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;

      // Get user data
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          avatarColor: true,
          isVerified: true,
        },
      });

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  // Handle socket connections
  io.on("connection", (socket) => {
    console.log(
      `✅ User connected: ${socket.user.fullName} (${socket.userId})`,
    );

    // Add socket for this user (supports multi-tab/device sessions)
    const connectionsCount = addUserSocket(socket.userId, socket.id);

    // Send current online users snapshot to the newly connected socket
    socket.emit("online_users", {
      userIds: Array.from(onlineUsers.keys()),
    });

    // Emit user_online only on first active connection
    if (connectionsCount === 1) {
      io.emit("user_online", {
        userId: socket.userId,
        user: socket.user,
      });
    }

    // ===================================
    // JOIN CONVERSATION ROOM
    // ===================================
    socket.on("join_conversation", async (payload) => {
      try {
        const conversationId =
          typeof payload === "string" ? payload : payload?.conversationId;

        if (!conversationId) {
          socket.emit("error", { message: "conversationId is required" });
          return;
        }

        // Verify user is participant
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          select: { user1Id: true, user2Id: true },
        });

        if (
          !conversation ||
          (conversation.user1Id !== socket.userId &&
            conversation.user2Id !== socket.userId)
        ) {
          socket.emit("error", {
            message: "Access denied to this conversation",
          });
          return;
        }

        socket.join(conversationId);
        console.log(
          `User ${socket.userId} joined conversation ${conversationId}`,
        );
      } catch (error) {
        console.error("Join conversation error:", error);
        socket.emit("error", { message: "Failed to join conversation" });
      }
    });

    // ===================================
    // LEAVE CONVERSATION ROOM
    // ===================================
    socket.on("leave_conversation", (payload) => {
      const conversationId =
        typeof payload === "string" ? payload : payload?.conversationId;

      if (!conversationId) {
        return;
      }

      socket.leave(conversationId);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // ===================================
    // SEND MESSAGE (REAL-TIME)
    // ===================================
    socket.on("send_message", async (data, callback) => {
      try {
        const { conversationId, text, clientTempId } = data;

        if (!text || text.trim() === "") {
          if (typeof callback === "function") {
            callback({ success: false, message: "Message cannot be empty" });
            return;
          }

          socket.emit("error", { message: "Message cannot be empty" });
          return;
        }

        // Verify user is participant
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          select: { user1Id: true, user2Id: true },
        });

        if (
          !conversation ||
          (conversation.user1Id !== socket.userId &&
            conversation.user2Id !== socket.userId)
        ) {
          if (typeof callback === "function") {
            callback({
              success: false,
              message: "Access denied to this conversation",
            });
            return;
          }

          socket.emit("error", {
            message: "Access denied to this conversation",
          });
          return;
        }

        // Create message in database
        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId: socket.userId,
            text: text.trim(),
          },
        });

        // Update conversation updated time
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });

        // Get recipient ID (the other user in the conversation)
        const recipientId =
          conversation.user1Id === socket.userId
            ? conversation.user2Id
            : conversation.user1Id;

        const recipientOnline = isUserOnline(recipientId);

        // Create notification for recipient if they're not currently online
        if (!recipientOnline) {
          await createNotification({
            userId: recipientId,
            type: "NEW_MESSAGE",
            title: "New message",
            message: `${socket.user.fullName} sent you a message: "${text.trim().substring(0, 50)}${text.trim().length > 50 ? "..." : ""}"`,
            relatedId: conversationId,
            relatedType: "conversation",
          });
        }

        // Emit message to conversation room
        const realtimeMessage = {
          id: message.id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          text: message.text,
          isRead: message.isRead,
          deliveryState: "SENT",
          createdAt: message.createdAt,
          sender: socket.user,
        };

        io.to(conversationId).emit("message_received", realtimeMessage);

        // Acknowledge persistence/delivery state back to sender for optimistic UI sync
        socket.emit("message_delivered", {
          messageId: message.id,
          conversationId,
          clientTempId: clientTempId || null,
          deliveredToRecipient: recipientOnline,
        });

        if (typeof callback === "function") {
          callback({ success: true, data: realtimeMessage });
        }

        console.log(`Message sent in conversation ${conversationId}`);
      } catch (error) {
        console.error("Send message error:", error);

        if (typeof callback === "function") {
          callback({ success: false, message: "Failed to send message" });
          return;
        }

        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // ===================================
    // MARK MESSAGE AS READ
    // ===================================
    socket.on("mark_read", async (data) => {
      try {
        const { messageId, conversationId: payloadConversationId } = data;

        if (!messageId) {
          socket.emit("error", { message: "messageId is required" });
          return;
        }

        const existingMessage = await prisma.message.findUnique({
          where: { id: messageId },
          include: {
            conversation: {
              select: {
                id: true,
                user1Id: true,
                user2Id: true,
              },
            },
          },
        });

        if (!existingMessage) {
          socket.emit("error", { message: "Message not found" });
          return;
        }

        const conversationId =
          payloadConversationId || existingMessage.conversationId;

        if (
          existingMessage.conversation.user1Id !== socket.userId &&
          existingMessage.conversation.user2Id !== socket.userId
        ) {
          socket.emit("error", { message: "Access denied" });
          return;
        }

        // Update message
        await prisma.message.update({
          where: { id: messageId },
          data: { isRead: true },
        });

        // Emit to conversation room
        io.to(conversationId).emit("message_read", {
          messageId,
          conversationId,
        });

        console.log(`Message ${messageId} marked as read`);
      } catch (error) {
        console.error("Mark read error:", error);
        socket.emit("error", { message: "Failed to mark as read" });
      }
    });

    // ===================================
    // TYPING INDICATOR
    // ===================================
    socket.on("typing", (data) => {
      const { conversationId } = data;
      socket.to(conversationId).emit("user_typing", {
        conversationId,
        userId: socket.userId,
        user: socket.user,
      });
    });

    socket.on("stop_typing", (data) => {
      const { conversationId } = data;
      socket.to(conversationId).emit("user_stop_typing", {
        conversationId,
        userId: socket.userId,
      });
    });

    // ===================================
    // DISCONNECT
    // ===================================
    socket.on("disconnect", async () => {
      console.log(
        `❌ User disconnected: ${socket.user.fullName} (${socket.userId})`,
      );

      // Update lastLogin timestamp
      try {
        await prisma.user.update({
          where: { id: socket.userId },
          data: { lastLogin: new Date() },
        });
      } catch (error) {
        console.error("Failed to update lastLogin:", error);
      }

      // Remove this socket; user is offline only when last socket disconnects
      const remainingConnections = removeUserSocket(socket.userId, socket.id);

      if (remainingConnections === 0) {
        io.emit("user_offline", {
          userId: socket.userId,
        });
      }
    });

    // ===================================
    // ERROR HANDLING
    // ===================================
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  console.log("✅ Socket.io chat handler initialized");
};

// ===================================
// GET ONLINE USERS
// ===================================
export const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

export default { setupSocket, getOnlineUsers };
