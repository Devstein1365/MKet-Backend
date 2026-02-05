// ===================================
// GENERAL ROUTES
// ===================================
// This file contains general routes like health checks, API info, etc.
// Not related to any specific feature (auth, products, etc.)
// ===================================

import express from "express";

const router = express.Router();

// ===================================
// ROOT ENDPOINT - API Information
// ===================================
// GET /
// Shows basic API information and version
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🎯 MKET Marketplace API",
    version: "2.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      products: "/api/products",
      wishlist: "/api/wishlist",
      notifications: "/api/notifications",
    },
  });
});

// ===================================
// HEALTH CHECK ENDPOINT
// ===================================
// GET /api/health
// Used to check if the server is running
// Useful for monitoring tools, deployment checks, etc.
router.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running smoothly! 🚀",
    database: "PostgreSQL",
    orm: "Prisma",
    timestamp: new Date().toISOString(),
  });
});

export default router;
