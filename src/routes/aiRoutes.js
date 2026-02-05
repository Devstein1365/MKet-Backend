// ===================================
// AI ROUTES
// ===================================
// Routes for AI-powered features
// Base path: /api/ai
// ===================================

import express from "express";
import {
  generateProductDescription,
  checkAIHealth,
} from "../controllers/aiController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// ===================================
// PROTECTED ROUTES (Authentication required)
// ===================================

// Generate product description using AI
// POST /api/ai/generate-description
// Headers: Authorization: Bearer <token>
// Body: { title, category, condition, price, location }
router.post("/generate-description", auth, generateProductDescription);

// ===================================
// PUBLIC ROUTES
// ===================================

// Health check for AI service
// GET /api/ai/health
router.get("/health", checkAIHealth);

export default router;
