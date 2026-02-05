// ===================================
// REPORT CONTROLLER
// ===================================
// Handles user and product reports
// ===================================

import prisma from "../config/prisma.js";

// ===================================
// CREATE REPORT
// ===================================
// POST /api/reports
// Body: { reportedUserId OR reportedProductId, reason, description }
// Requires: Authentication
export const createReport = async (req, res) => {
  try {
    const { reportedUserId, reportedProductId, reason, description } = req.body;

    // Validation
    if (!reportedUserId && !reportedProductId) {
      return res.status(400).json({
        success: false,
        message: "Please provide either reportedUserId or reportedProductId",
      });
    }

    if (reportedUserId && reportedProductId) {
      return res.status(400).json({
        success: false,
        message: "Cannot report both user and product at the same time",
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Please provide a reason for the report",
      });
    }

    // Don't allow users to report themselves
    if (reportedUserId === req.userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot report yourself",
      });
    }

    // Check if entity exists
    if (reportedUserId) {
      const user = await prisma.user.findUnique({
        where: { id: reportedUserId },
      });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Reported user not found",
        });
      }
    }

    if (reportedProductId) {
      const product = await prisma.product.findUnique({
        where: { id: reportedProductId },
      });
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Reported product not found",
        });
      }
    }

    // Check if user already reported this entity
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: req.userId,
        ...(reportedUserId && { reportedUserId }),
        ...(reportedProductId && { reportedProductId }),
      },
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: "You have already reported this",
      });
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        reporterId: req.userId,
        reportedUserId: reportedUserId || null,
        reportedProductId: reportedProductId || null,
        reason,
        description: description || null,
        status: "PENDING",
      },
      include: {
        reporter: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        reportedUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        reportedProduct: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Report submitted successfully. We'll review it shortly.",
      report,
    });
  } catch (error) {
    console.error("Create report error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit report",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// GET USER'S REPORTS
// ===================================
// GET /api/reports
// Requires: Authentication
export const getMyReports = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: { reporterId: req.userId },
      include: {
        reportedUser: {
          select: {
            id: true,
            fullName: true,
          },
        },
        reportedProduct: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load reports",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// UPDATE REPORT STATUS (ADMIN ONLY)
// ===================================
// PUT /api/reports/:id
// Body: { status, adminNotes }
// Requires: Authentication + Admin role
// Note: Admin functionality to be implemented later
export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    // TODO: Add admin check middleware
    // For now, this is a placeholder for future admin functionality

    const validStatuses = ["PENDING", "REVIEWED", "RESOLVED", "DISMISSED"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const report = await prisma.report.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(adminNotes && { adminNotes }),
      },
      include: {
        reporter: {
          select: {
            id: true,
            fullName: true,
          },
        },
        reportedUser: {
          select: {
            id: true,
            fullName: true,
          },
        },
        reportedProduct: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: "Report updated successfully",
      report,
    });
  } catch (error) {
    console.error("Update report error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update report",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
