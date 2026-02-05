// ===================================
// PRODUCT ROUTES
// ===================================
// All routes for product operations
// Base path: /api/products
// ===================================

import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getUserProducts,
  getMyProducts,
  markAsSold,
  incrementViews,
} from "../controllers/productController.js";
import {
  addReview,
  getProductReviews,
  deleteReview,
} from "../controllers/reviewController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// ===================================
// PUBLIC ROUTES (No authentication required)
// ===================================

// Get all products with filters
// GET /api/products?category=electronics&condition=new&minPrice=1000&maxPrice=50000&location=MM Castle&search=iphone&sort=newest&page=1&limit=20
router.get("/", getAllProducts);

// Get user's products (public profile view)
// GET /api/products/user/:userId?status=available
router.get("/user/:userId", getUserProducts);

// Get product by ID (must be after /user/:userId to avoid conflict)
// GET /api/products/:id
router.get("/:id", getProductById);

// Increment product views
// POST /api/products/:id/increment-views
router.post("/:id/increment-views", incrementViews);

// Get product reviews
// GET /api/products/:id/reviews
router.get("/:id/reviews", getProductReviews);

// ===================================
// PROTECTED ROUTES (Authentication required)
// ===================================

// Get my products (before POST / to avoid conflict)
// GET /api/products/my-products?status=available
// Headers: Authorization: Bearer <token>
router.get("/my-products", auth, getMyProducts);

// Create new product
// POST /api/products
// Headers: Authorization: Bearer <token>
// Body: { title, description, images[], category, condition, price, originalPrice, location, status }
router.post("/", auth, createProduct);

// Update product
// PUT /api/products/:id
// Headers: Authorization: Bearer <token>
// Body: { title, description, images[], category, condition, price, originalPrice, location, status }
router.put("/:id", auth, updateProduct);

// Delete product
// DELETE /api/products/:id
// Headers: Authorization: Bearer <token>
router.delete("/:id", auth, deleteProduct);

// Mark product as sold
// PUT /api/products/:id/mark-sold
// Headers: Authorization: Bearer <token>
router.put("/:id/mark-sold", auth, markAsSold);

// Add product review
// POST /api/products/:id/reviews
// Headers: Authorization: Bearer <token>
// Body: { rating, comment }
router.post("/:id/reviews", auth, addReview);

// Delete review
// DELETE /api/reviews/:reviewId
// Headers: Authorization: Bearer <token>
router.delete("/reviews/:reviewId", auth, deleteReview);

export default router;
