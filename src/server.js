// ===================================
// MKET MARKETPLACE - BACKEND SERVER
// ===================================
// This is the main entry point for the MKET backend API
//
// Tech Stack:
// - Express.js: Web server framework
// - PostgreSQL: Our database (stores users, products, etc.)
// - Prisma: ORM that makes database queries easy and type-safe
//
// What happens when this file runs:
// 1. Load environment variables from .env file
// 2. Connect to PostgreSQL database
// 3. Set up Express middleware (CORS, JSON parsing, etc.)
// 4. Register API routes (will add these soon!)
// 5. Start the server on port 3000
// ===================================

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDatabase } from "./config/prisma.js";

// Import Routes
import indexRoutes from "./routes/index.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

// Import Socket.io setup
import { setupSocket } from "./socket/chatSocket.js";

// ===================================
// STEP 1: LOAD ENVIRONMENT VARIABLES
// ===================================
// This reads your .env file and makes the variables available via process.env
// Example: process.env.PORT, process.env.DATABASE_URL, etc.
dotenv.config();

const allowedOrigins = (
  process.env.FRONTEND_URLS ||
  process.env.FRONTEND_URL ||
  "http://localhost:1365,http://localhost:5173,http://localhost:5174,https://mket13.vercel.app"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOriginValidator = (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) {
    return callback(null, true);
  }

  return callback(new Error(`CORS blocked for origin: ${origin}`));
};

// ===================================
// STEP 2: CREATE EXPRESS APPLICATION
// ===================================
// Express is a web framework that handles HTTP requests/responses
// Think of it as the foundation that processes API calls from your frontend
const app = express();

// Create HTTP server and Socket.io instance
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// ===================================
// STEP 3: CONFIGURE MIDDLEWARE
// ===================================
// Middleware = Functions that process requests before they reach your routes
// They run in the order you define them here

// MIDDLEWARE 1: CORS (Cross-Origin Resource Sharing)
// ------------------------------------------------------
// Problem: Browsers block requests from different origins (security)
// Solution: CORS tells the browser "It's okay, trust this frontend"
//
// Your frontend runs on: http://localhost:5173 (Vite default)
// Your backend runs on:  http://localhost:3000
// Without CORS, the browser would block all API calls!

app.use(
  cors({
    origin: corsOriginValidator,
    credentials: true, // Allow cookies/auth headers to be sent
  }),
);

// MIDDLEWARE 2: JSON BODY PARSER
// ------------------------------------------------------
// Converts incoming JSON data into JavaScript objects
// Example: When frontend sends { "email": "user@example.com", "password": "123" }
// This middleware parses it so you can access it via req.body.email
app.use(express.json());

// MIDDLEWARE 3: URL-ENCODED BODY PARSER
// ------------------------------------------------------
// Handles form data (like when submitting HTML forms)
// Extended: true allows nested objects in the data
app.use(express.urlencoded({ extended: true }));

// MIDDLEWARE 4: REQUEST LOGGER (Simple)
// ------------------------------------------------------
// Logs every request to the console (helpful for debugging)

// General routes (health check, API info, etc.)
app.use("/", indexRoutes);

// Authentication routes (signup, login, verify, reset password, etc.)
app.use("/api/auth", authRoutes);

// Product routes (create, get, update, delete products)
app.use("/api/products", productRoutes);

// Wishlist routes (add/remove/get wishlist items)
app.use("/api/wishlist", wishlistRoutes);

// Notification routes (get/mark read/delete notifications)
app.use("/api/notifications", notificationRoutes);

// Report routes (create/get reports)
app.use("/api/reports", reportRoutes);

// AI routes (generate descriptions, AI features)
app.use("/api/ai", aiRoutes);

// Chat 6: START THE SERVER
// ===================================
// This is an async function so we can wait for database connection
const startServer = async () => {
  try {
    // First, connect to the database
    console.log("🔄 Connecting to PostgreSQL database...");
    await connectDatabase();

    // Then start the HTTP server (with Socket.io)
    const PORT = process.env.PORT || 3000;

    httpServer.listen(PORT, () => {
      console.log("");
      console.log("========================================");
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`💾 Database: PostgreSQL + Prisma`);
      console.log(`🔌 Socket.io: Enabled (Real-time Chat)`);
      console.log("========================================");
      console.log("");
      console.log("✨ Ready to accept requests!");
      console.log("   - REST API: http://localhost:3000/api");
      console.log("   - Socket.io: ws://localhost:3000");
      console.log("   - Health Check: http://localhost:3000/api/health");
      console.log("");
      console.log("📋 Available Routes:");
      console.log("   ✅ /api/auth - Authentication");
      console.log("   ✅ /api/products - Products");
      console.log("   ✅ /api/wishlist - Wishlist");
      console.log("   ✅ /api/notifications - Notifications");
      console.log("   ✅ /api/reports - Reports");
      console.log("   ✅ /api/ai - AI Features (Gemini)");
      console.log("   ✅ /api/conversations - Chat (REST)");
      console.log("   ✅ Socket.io - Chat (Real-time)");
      console.log("========================================");
    });
  } catch (error) {
    console.error("❌ Failed to start server:");
    console.error(error);
    process.exit(1);
  }
};

// Start the server!
startServer();

// ===================================
// EXPORT FOR TESTING
// ===================================
// Export the Express app for testing purposes (optional)
export default app;
