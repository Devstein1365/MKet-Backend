import express from "express";
import {
  signup,
  login,
  getMe,
  updateProfile,
  changePassword,
  getUserById,
} from "../controller/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.get("/user/:id", getUserById);

// Protected routes
router.get("/me", protect, getMe);
router.put("/update", protect, updateProfile);
router.put("/change-password", protect, changePassword);

export default router;
