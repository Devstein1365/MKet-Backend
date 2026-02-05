// ===================================
// AUTHENTICATION MIDDLEWARE
// ===================================
// Protects routes by verifying JWT tokens
// Attaches user ID to request object for use in controllers
// ===================================

import jwt from "jsonwebtoken";

// ===================================
// PROTECT ROUTE MIDDLEWARE
// ===================================
// Verifies JWT token and attaches userId to request
// Usage: Add this middleware to any route that requires authentication
// Example: router.get('/profile', auth, getProfile);
export const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    // Expected format: "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user ID to request object
      // Controllers can now access req.userId
      req.userId = decoded.userId;

      // Continue to next middleware/controller
      next();
    } catch (jwtError) {
      // Token is invalid or expired
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token. Please login again.",
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// OPTIONAL AUTH MIDDLEWARE
// ===================================
// Similar to auth middleware, but doesn't reject if no token
// Useful for routes that work for both authenticated and anonymous users
// If token is valid, attaches userId. If not, continues without userId.
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // No token, but that's okay for optional auth
      return next();
    }

    const token = authHeader.substring(7);

    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
    } catch (jwtError) {
      // Token invalid, but continue anyway (optional auth)
      console.log("Invalid token in optional auth:", jwtError.message);
    }

    next();
  } catch (error) {
    console.error("Optional auth middleware error:", error);
    next(); // Continue even if error (optional auth)
  }
};

export default auth;
