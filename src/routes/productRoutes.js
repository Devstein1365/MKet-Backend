import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getUserProducts,
  addReview,
  markAsSold,
  getMyProducts,
  getMyDrafts,
  publishDraft,
  getProductsByCategory,
  searchProducts,
} from "../controller/productController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/search", searchProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/user/:userId", getUserProducts);
router.get("/:id", getProductById);

// Protected routes
router.get("/my/products", protect, getMyProducts);
router.get("/my/drafts", protect, getMyDrafts);
router.post("/", protect, createProduct);
router.put("/:id", protect, updateProduct);
router.put("/:id/publish", protect, publishDraft);
router.delete("/:id", protect, deleteProduct);
router.post("/:id/reviews", protect, addReview);
router.put("/:id/sold", protect, markAsSold);

export default router;
