import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Allow all origins for development - Remove in production!
app.use(cors());
app.use(express.json({ limit: "50mb" })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: "50mb" })); // Parse URL-encoded bodies

// Health check route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MKET API Server is running! 🚀",
    version: "1.0.0",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/notifications", notificationRoutes);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
});
