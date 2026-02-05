// ===================================
// REPORT ROUTES
// ===================================
// All routes for report operations
// Base path: /api/reports
// ===================================

import express from "express";
import {
  createReport,
  getMyReports,
  updateReportStatus,
} from "../controllers/reportController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// All report routes require authentication

// Create new report
// POST /api/reports
// Body: { reportedUserId OR reportedProductId, reason, description }
router.post("/", auth, createReport);

// Get user's reports
// GET /api/reports
router.get("/", auth, getMyReports);

// Update report status (admin only - to be implemented)
// PUT /api/reports/:id
// Body: { status, adminNotes }
router.put("/:id", auth, updateReportStatus);

export default router;
