// ===================================
// AUTHENTICATION CONTROLLER
// ===================================
// Handles all authentication operations:
// - User registration with email verification
// - Login with JWT token generation
// - Email verification
// - Password reset flow
// - Profile management
// ===================================

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../config/prisma.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../utils/emailService.js";

// ===================================
// HELPER FUNCTIONS
// ===================================

// Generate random hex color for user avatar (when no image uploaded)
const generateRandomColor = () => {
  const colors = [
    "#7E22CE", // Purple
    "#14B8A6", // Teal
    "#F59E0B", // Amber
    "#EC4899", // Pink
    "#10B981", // Green
    "#EF4444", // Red
    "#8B5CF6", // Violet
    "#3B82F6", // Blue
    "#F97316", // Orange
    "#6366F1", // Indigo
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// Generate verification token (for email verification)
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Format user data for frontend (remove sensitive fields)
const formatUserResponse = (user) => {
  const { password, verificationToken, resetToken, ...userWithoutSensitive } =
    user;
  return userWithoutSensitive;
};

// ===================================
// REGISTER NEW USER
// ===================================
// POST /api/auth/signup
// Body: { name, email, password, phone, studentId }
export const signup = async (req, res) => {
  try {
    const { name, email, password, phone, studentId } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    // Validation
    if (!name || !normalizedEmail || !password || !phone || !studentId) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields (name, email, password, phone, studentId)",
      });
    }

    // Validate name (must have at least 2 names)
    const nameParts = name
      .trim()
      .split(" ")
      .filter((n) => n.length > 0);
    if (nameParts.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Full name must include at least two names (first name and last name)",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Validate phone number (must be exactly 11 digits)
    if (!/^\d{11}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be exactly 11 digits",
      });
    }

    // Validate password strength (frontend already validates, but double-check)
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one uppercase letter",
      });
    }

    if (!/[a-z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one lowercase letter",
      });
    }

    if (!/[0-9]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one number",
      });
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one special character",
      });
    }

    // Check if email already exists
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered. Please login instead.",
      });
    }

    // Check if student ID already exists
    const existingUserByStudentId = await prisma.user.findUnique({
      where: { studentId },
    });

    if (existingUserByStudentId) {
      return res.status(400).json({
        success: false,
        message: "This student ID is already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Generate random avatar color
    const avatarColor = generateRandomColor();

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName: name,
        email: normalizedEmail,
        password: hashedPassword,
        phone,
        studentId,
        avatarColor,
        verificationToken,
        verificationExpires,
      },
    });

    // Generate JWT token
    const token = generateToken(user.id);

    // Return user data (without sensitive fields)
    const userResponse = formatUserResponse(user);

    // Send response response IMMEDIATELY to frontend
    // Email will be sent in the background to avoid holding the request for 10-30s
    res.status(201).json({
      success: true,
      message:
        "Account created successfully! Please check your email to verify your account.",
      token,
      user: userResponse,
    });

    // Send verification email (BACKGROUND PROCESS)
    sendVerificationEmail(user.email, user.fullName, verificationToken).catch(
      (emailError) => {
        console.error(
          "Background error sending verification email:",
          emailError,
        );
      },
    );
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create account. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// LOGIN USER
// ===================================
// POST /api/auth/login
// Body: { email, password }
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    // Validation
    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    console.log("🔍 Login attempt for:", normalizedEmail);
    console.log("👤 User found:", !!user);

    if (!user) {
      console.log("❌ User not found in database");
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    console.log("🔐 Comparing passwords...");
    console.log(
      "Password provided:",
      password ? `${password.length} chars` : "empty",
    );
    console.log("Password hash in DB:", user.password ? "exists" : "missing");

    // Check password
    const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(user.password || "");
    let isPasswordValid = false;

    if (isBcryptHash) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      isPasswordValid = password === user.password;

      // Auto-migrate legacy plain-text password to bcrypt hash
      if (isPasswordValid) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword },
        });
      }
    }

    console.log("✅ Password valid:", isPasswordValid);

    if (!isPasswordValid) {
      console.log("❌ Password comparison failed");
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    console.log("✅ Login successful for:", normalizedEmail);

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your email before logging in. Check your inbox for the verification link.",
      });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate JWT token
    const token = generateToken(user.id);

    // Return user data (without sensitive fields)
    const userResponse = formatUserResponse(user);

    res.json({
      success: true,
      message: "Login successful!",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// GET CURRENT USER PROFILE
// ===================================
// GET /api/auth/me
// Requires: Authentication (JWT token)
export const getMe = async (req, res) => {
  try {
    // User ID is attached to req by auth middleware
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userResponse = formatUserResponse(user);

    res.json({
      success: true,
      user: userResponse,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// UPDATE USER PROFILE
// ===================================
// PUT /api/auth/update
// Body: { bio, location, phone, avatarPublicId, avatarUrl }
// Requires: Authentication
export const updateProfile = async (req, res) => {
  try {
    const { bio, location, phone, avatarPublicId, avatarUrl } = req.body;

    // Validate bio length (max 120 words)
    if (bio) {
      const wordCount = bio.trim().split(/\s+/).length;
      if (wordCount > 120) {
        return res.status(400).json({
          success: false,
          message: "Bio must not exceed 120 words",
        });
      }
    }

    // Validate phone if provided
    if (phone && !/^\d{11}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be exactly 11 digits",
      });
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
        ...(phone !== undefined && { phone }),
        ...(avatarPublicId !== undefined && { avatarPublicId }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
    });

    const userResponse = formatUserResponse(user);

    res.json({
      success: true,
      message: "Profile updated successfully!",
      user: userResponse,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// CHANGE PASSWORD
// ===================================
// PUT /api/auth/change-password
// Body: { currentPassword, newPassword }
// Requires: Authentication
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password",
      });
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: req.userId },
      data: { password: hashedPassword },
    });

    res.json({
      success: true,
      message: "Password changed successfully!",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// GET USER BY ID (Public Profile)
// ===================================
// GET /api/auth/user/:userId
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        bio: true,
        location: true,
        avatarPublicId: true,
        avatarUrl: true,
        avatarColor: true,
        isVerified: true,
        totalListings: true,
        totalSold: true,
        averageRating: true,
        totalReviews: true,
        createdAt: true,
        // Don't include password, tokens, etc.
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// VERIFY EMAIL
// ===================================
// GET /api/auth/verify-email/:token
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Find user with this verification token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationExpires: {
          gt: new Date(), // Token not expired
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Mark user as verified and clear verification data
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationExpires: null,
      },
    });

    res.json({
      success: true,
      message: "Email verified successfully! You can now login.",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Email verification failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// RESEND VERIFICATION EMAIL
// ===================================
// POST /api/auth/resend-verification
// Requires: Authentication
export const resendVerification = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Your email is already verified",
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.update({
      where: { id: req.userId },
      data: {
        verificationToken,
        verificationExpires,
      },
    });

    // Send response response IMMEDIATELY
    res.json({
      success: true,
      message: "Verification email sent! Please check your inbox.",
    });

    // Send verification email (BACKGROUND PROCESS)
    sendVerificationEmail(user.email, user.fullName, verificationToken).catch(
      (emailError) => {
        console.error(
          "Background error sending protected verification email:",
          emailError,
        );
      },
    );
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send verification email",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// RESEND VERIFICATION EMAIL (PUBLIC)
// ===================================
// POST /api/auth/resend-verification-email
// Body: { email }
export const resendVerificationByEmail = async (req, res) => {
  try {
    const normalizedEmail = req.body?.email?.trim()?.toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Please provide your email address",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.json({
        success: true,
        message: "If that email exists, a verification link has been sent.",
      });
    }

    if (user.isVerified) {
      return res.json({
        success: true,
        message: "Email is already verified. Please login.",
      });
    }

    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationExpires,
      },
    });

    // Send response response IMMEDIATELY
    res.json({
      success: true,
      message: "If that email exists, a verification link has been sent.",
    });

    // Send verification email (BACKGROUND PROCESS)
    sendVerificationEmail(user.email, user.fullName, verificationToken).catch(
      (emailError) => {
        console.error(
          "Background error sending public verification email:",
          emailError,
        );
      },
    );
  } catch (error) {
    console.error("Public resend verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send verification email",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// REQUEST PASSWORD RESET
// ===================================
// POST /api/auth/forgot-password
// Body: { email }
export const forgotPassword = async (req, res) => {
  try {
    const normalizedEmail = req.body?.email?.trim()?.toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Please provide your email address",
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Don't reveal if email exists or not (security)
    if (!user) {
      return res.json({
        success: true,
        message: "If that email exists, a password reset link has been sent.",
      });
    }

    // Allow password reset requests only for accounts that have logged in before
    if (!user.lastLogin) {
      return res.json({
        success: true,
        message: "If that email exists, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = generateVerificationToken();
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    });

    // Send response response IMMEDIATELY
    res.json({
      success: true,
      message: "If that email exists, a password reset link has been sent.",
    });

    // Send password reset email (BACKGROUND PROCESS)
    sendPasswordResetEmail(user.email, user.fullName, resetToken).catch(
      (emailError) => {
        console.error(
          "Background error sending password reset email:",
          emailError,
        );
      },
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// RESET PASSWORD
// ===================================
// POST /api/auth/reset-password
// Body: { token, newPassword }
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide reset token and new password",
      });
    }

    // Validate new password
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gt: new Date(), // Token not expired
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    res.json({
      success: true,
      message:
        "Password reset successfully! You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// UPDATE SETTINGS
// ===================================
// PUT /api/auth/settings
// Body: { notificationsEnabled, emailNotifications, pushNotifications, messageNotifications, listingUpdates }
// Requires: Authentication
export const updateSettings = async (req, res) => {
  try {
    const {
      notificationsEnabled,
      emailNotifications,
      pushNotifications,
      messageNotifications,
      listingUpdates,
    } = req.body;

    const parseBoolean = (value) => {
      if (typeof value === "boolean") return value;
      if (value === "true") return true;
      if (value === "false") return false;
      return undefined;
    };

    const normalizedSettings = {
      notificationsEnabled: parseBoolean(notificationsEnabled),
      emailNotifications: parseBoolean(emailNotifications),
      pushNotifications: parseBoolean(pushNotifications),
      messageNotifications: parseBoolean(messageNotifications),
      listingUpdates: parseBoolean(listingUpdates),
    };

    const hasAnySetting = Object.values(normalizedSettings).some(
      (value) => value !== undefined,
    );

    if (!hasAnySetting) {
      return res.status(400).json({
        success: false,
        message: "No valid settings provided",
      });
    }

    let user;

    try {
      // Primary path: use Prisma model fields directly
      user = await prisma.user.update({
        where: { id: req.userId },
        data: {
          ...(normalizedSettings.notificationsEnabled !== undefined && {
            notificationsEnabled: normalizedSettings.notificationsEnabled,
          }),
          ...(normalizedSettings.emailNotifications !== undefined && {
            emailNotifications: normalizedSettings.emailNotifications,
          }),
          ...(normalizedSettings.pushNotifications !== undefined && {
            pushNotifications: normalizedSettings.pushNotifications,
          }),
          ...(normalizedSettings.messageNotifications !== undefined && {
            messageNotifications: normalizedSettings.messageNotifications,
          }),
          ...(normalizedSettings.listingUpdates !== undefined && {
            listingUpdates: normalizedSettings.listingUpdates,
          }),
        },
      });
    } catch (updateError) {
      // Fallback path: update only columns that exist in DB to avoid schema mismatch 500s
      const columns = await prisma.$queryRawUnsafe(
        "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users'",
      );

      const existingColumns = new Set(columns.map((col) => col.column_name));
      const assignments = [];
      const values = [];
      let idx = 1;

      const addAssignment = (columnName, value) => {
        if (value === undefined || !existingColumns.has(columnName)) return;
        assignments.push(`${columnName} = $${idx}`);
        values.push(value);
        idx += 1;
      };

      addAssignment(
        "notifications_enabled",
        normalizedSettings.notificationsEnabled,
      );
      addAssignment(
        "email_notifications",
        normalizedSettings.emailNotifications,
      );
      addAssignment("push_notifications", normalizedSettings.pushNotifications);
      addAssignment(
        "message_notifications",
        normalizedSettings.messageNotifications,
      );
      addAssignment("listing_updates", normalizedSettings.listingUpdates);

      if (assignments.length === 0) {
        throw updateError;
      }

      values.push(req.userId);
      await prisma.$executeRawUnsafe(
        `UPDATE users SET ${assignments.join(", ")} WHERE id = $${idx}`,
        ...values,
      );

      user = await prisma.user.findUnique({ where: { id: req.userId } });
    }

    const userResponse = formatUserResponse(user);

    // Ensure immediate frontend sync even if some fields are unavailable in client model
    if (normalizedSettings.notificationsEnabled !== undefined) {
      userResponse.notificationsEnabled =
        normalizedSettings.notificationsEnabled;
    }
    if (normalizedSettings.emailNotifications !== undefined) {
      userResponse.emailNotifications = normalizedSettings.emailNotifications;
    }
    if (normalizedSettings.pushNotifications !== undefined) {
      userResponse.pushNotifications = normalizedSettings.pushNotifications;
    }
    if (normalizedSettings.messageNotifications !== undefined) {
      userResponse.messageNotifications =
        normalizedSettings.messageNotifications;
    }
    if (normalizedSettings.listingUpdates !== undefined) {
      userResponse.listingUpdates = normalizedSettings.listingUpdates;
    }

    res.json({
      success: true,
      message: "Settings updated successfully!",
      user: userResponse,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update settings",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
