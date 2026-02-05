// ===================================
// WISHLIST ROUTES
// ===================================
// All routes for wishlist operations
// Base path: /api/wishlist
// ===================================

import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
  clearWishlist,
} from "../controllers/wishlistController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// All wishlist routes require authentication

// Get user's wishlist
// GET /api/wishlist
router.get("/", auth, getWishlist);

// Check if product is in wishlist
// GET /api/wishlist/check/:productId
router.get("/check/:productId", auth, checkWishlist);

// Add product to wishlist
// POST /api/wishlist/:productId
router.post("/:productId", auth, addToWishlist);

// Remove product from wishlist
// DELETE /api/wishlist/:productId
router.delete("/:productId", auth, removeFromWishlist);

// Clear entire wishlist
// DELETE /api/wishlist
router.delete("/", auth, clearWishlist);

export default router;
