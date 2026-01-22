import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlist,
} from "../controller/wishlistController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All wishlist routes are protected
router.get("/", protect, getWishlist);
router.post("/:productId", protect, addToWishlist);
router.delete("/:productId", protect, removeFromWishlist);
router.delete("/", protect, clearWishlist);
router.get("/check/:productId", protect, checkWishlist);

export default router;
