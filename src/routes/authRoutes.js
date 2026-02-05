// ===================================
// AUTHENTICATION ROUTES
// ===================================
// All routes for user authentication and profile management
// Base path: /api/auth
// ===================================

import express from "express";
import {
  signup,
  login,
  getMe,
  updateProfile,
  changePassword,
  getUserById,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  updateSettings,
} from "../controllers/authController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// ===================================
// PUBLIC ROUTES (No authentication required)
// ===================================

// Register new user
// POST /api/auth/signup
// Body: { name, email, password, phone, studentId }
router.post("/signup", signup);

// Login user
// POST /api/auth/login
// Body: { email, password }
router.post("/login", login);

// Verify email with token
// GET /api/auth/verify-email/:token
router.get("/verify-email/:token", verifyEmail);

// Request password reset
// POST /api/auth/forgot-password
// Body: { email }
router.post("/forgot-password", forgotPassword);

// Reset password with token
// POST /api/auth/reset-password
// Body: { token, newPassword }
router.post("/reset-password", resetPassword);

// Get public user profile
// GET /api/auth/user/:userId
router.get("/user/:userId", getUserById);

// ===================================
// PROTECTED ROUTES (Authentication required)
// ===================================

// Get current user profile
// GET /api/auth/me
// Headers: Authorization: Bearer <token>
router.get("/me", auth, getMe);

// Update user profile
// PUT /api/auth/update
// Headers: Authorization: Bearer <token>
// Body: { bio, location, phone, avatarPublicId, avatarUrl }
router.put("/update", auth, updateProfile);

// Change password
// PUT /api/auth/change-password
// Headers: Authorization: Bearer <token>
// Body: { currentPassword, newPassword }
router.put("/change-password", auth, changePassword);

// Update settings
// PUT /api/auth/settings
// Headers: Authorization: Bearer <token>
// Body: { notificationsEnabled, emailNotifications }
router.put("/settings", auth, updateSettings);

// Resend verification email
// POST /api/auth/resend-verification
// Headers: Authorization: Bearer <token>
router.post("/resend-verification", auth, resendVerification);

export default router;
