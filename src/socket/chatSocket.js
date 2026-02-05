// ===================================
// SOCKET.IO CHAT HANDLER
// ===================================
// Handles real-time chat functionality
// ===================================

import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

// Store online users {userId: socketId}
const onlineUsers = new Map();

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

    // Add user to online users
    onlineUsers.set(socket.userId, socket.id);

    // Emit user online status to all clients
    io.emit("user_online", {
      userId: socket.userId,
      user: socket.user,
    });

    // ===================================
    // JOIN CONVERSATION ROOM
    // ===================================
    socket.on("join_conversation", async (conversationId) => {
      try {
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
    socket.on("leave_conversation", (conversationId) => {
      socket.leave(conversationId);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // ===================================
    // SEND MESSAGE (REAL-TIME)
    // ===================================
    socket.on("send_message", async (data) => {
      try {
        const { conversationId, text } = data;

        if (!text || text.trim() === "") {
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

        // Emit message to conversation room
        io.to(conversationId).emit("message_received", {
          id: message.id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          text: message.text,
          isRead: message.isRead,
          createdAt: message.createdAt,
          sender: socket.user,
        });

        console.log(`Message sent in conversation ${conversationId}`);
      } catch (error) {
        console.error("Send message error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // ===================================
    // MARK MESSAGE AS READ
    // ===================================
    socket.on("mark_read", async (data) => {
      try {
        const { messageId, conversationId } = data;

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
    socket.on("disconnect", () => {
      console.log(
        `❌ User disconnected: ${socket.user.fullName} (${socket.userId})`,
      );

      // Remove from online users
      onlineUsers.delete(socket.userId);

      // Emit user offline status
      io.emit("user_offline", {
        userId: socket.userId,
      });
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
