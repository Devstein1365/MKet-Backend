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
import { connectDatabase } from "./config/prisma.js";

// ===================================
// STEP 1: LOAD ENVIRONMENT VARIABLES
// ===================================
// This reads your .env file and makes the variables available via process.env
// Example: process.env.PORT, process.env.DATABASE_URL, etc.
dotenv.config();

// ===================================
// STEP 2: CREATE EXPRESS APPLICATION
// ===================================
// Express is a web framework that handles HTTP requests/responses
// Think of it as the foundation that processes API calls from your frontend
const app = express();

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
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Allow your React app
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
// Example output: "GET /api/products" or "POST /api/auth/login"
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next(); // Pass control to the next middleware/route
});

// ===================================
// STEP 4: API ROUTES (Coming Soon!)
// ===================================
// This is where we'll connect our routes:
// - Authentication routes: /api/auth/login, /api/auth/register
// - Product routes: /api/products, /api/products/:id
// - Wishlist routes: /api/wishlist
// - Notification routes: /api/notifications
//
// For now, we just have test routes to verify the server works:

// Root endpoint - Shows API info
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🎯 MKET Marketplace API",
    version: "2.0.0",
    docs: "/api/docs", // Future: API documentation endpoint
  });
});

// Health check - Useful for monitoring if server is alive
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running smoothly! 🚀",
    database: "PostgreSQL",
    orm: "Prisma",
    timestamp: new Date().toISOString(),
  });
});

// ===================================
// STEP 5: START THE SERVER
// ===================================
// This is an async function so we can wait for database connection
const startServer = async () => {
  try {
    // First, connect to the database
    console.log("🔄 Connecting to PostgreSQL database...");
    await connectDatabase();

    // Then start the Express server
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log("");
      console.log("========================================");
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`💾 Database: PostgreSQL + Prisma`);
      console.log("========================================");
      console.log("");
      console.log("✨ Ready to accept requests!");
      console.log("   - Test in browser: http://localhost:3000");
      console.log("   - API docs: Coming soon!");
      console.log("");
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
