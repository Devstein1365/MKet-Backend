// ===================================
// CHAT ROUTES
// ===================================
// All routes for chat/messaging operations
// Base path: /api/chat
// ===================================

import express from "express";
import {
  createOrGetConversation,
  getConversations,
  getConversationById,
  getMessages,
  sendMessage,
  markMessageAsRead,
  markAllMessagesAsRead,
  deleteConversation,
} from "../controllers/chatController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// All chat routes require authentication

// Create or get conversation
// POST /api/conversations
// Body: { participantId, productId }
router.post("/conversations", auth, createOrGetConversation);

// Get user's conversations
// GET /api/conversations
router.get("/conversations", auth, getConversations);

// Get conversation by ID
// GET /api/conversations/:id
router.get("/conversations/:id", auth, getConversationById);

// Get messages in a conversation
// GET /api/conversations/:id/messages?page=1&limit=50
router.get("/conversations/:id/messages", auth, getMessages);

// Mark all messages in conversation as read
// PUT /api/conversations/:id/mark-all-read
router.put("/conversations/:id/mark-all-read", auth, markAllMessagesAsRead);

// Send message (REST - for non-real-time)
// POST /api/messages
// Body: { conversationId, text }
router.post("/messages", auth, sendMessage);

// Mark message as read
// PUT /api/messages/:id/read
router.put("/messages/:id/read", auth, markMessageAsRead);

// Delete conversation
// DELETE /api/conversations/:id
router.delete("/conversations/:id", auth, deleteConversation);

export default router;
