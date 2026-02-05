// ===================================
// REVIEW CONTROLLER
// ===================================
// Handles product reviews and ratings
// ===================================

import prisma from "../config/prisma.js";

// ===================================
// ADD REVIEW
// ===================================
// POST /api/products/:id/reviews
// Body: { rating, comment }
// Requires: Authentication
export const addReview = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { rating, comment } = req.body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { sellerId: true },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Don't allow users to review their own products
    if (product.sellerId === req.userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot review your own product",
      });
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId,
        reviewerId: req.userId,
      },
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        productId,
        reviewerId: req.userId,
        sellerId: product.sellerId,
        rating,
        comment: comment || null,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            avatarColor: true,
            isVerified: true,
          },
        },
      },
    });

    // Update seller's average rating
    const sellerReviews = await prisma.review.findMany({
      where: { sellerId: product.sellerId },
      select: { rating: true },
    });

    const avgRating =
      sellerReviews.reduce((sum, r) => sum + r.rating, 0) /
      sellerReviews.length;

    await prisma.user.update({
      where: { id: product.sellerId },
      data: {
        averageRating: avgRating.toFixed(1),
        totalReviews: sellerReviews.length,
      },
    });

    res.status(201).json({
      success: true,
      message: "Review added successfully!",
      review,
    });
  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add review",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// GET PRODUCT REVIEWS
// ===================================
// GET /api/products/:id/reviews
// Public route
export const getProductReviews = async (req, res) => {
  try {
    const { id: productId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        reviewer: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            avatarColor: true,
            isVerified: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load reviews",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// DELETE REVIEW
// ===================================
// DELETE /api/reviews/:reviewId
// Requires: Authentication + Ownership
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Check if review exists and belongs to user
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { reviewerId: true, sellerId: true },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.reviewerId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this review",
      });
    }

    // Delete review
    await prisma.review.delete({
      where: { id: reviewId },
    });

    // Update seller's average rating
    const sellerReviews = await prisma.review.findMany({
      where: { sellerId: review.sellerId },
      select: { rating: true },
    });

    const avgRating =
      sellerReviews.length > 0
        ? sellerReviews.reduce((sum, r) => sum + r.rating, 0) /
          sellerReviews.length
        : 0;

    await prisma.user.update({
      where: { id: review.sellerId },
      data: {
        averageRating: avgRating.toFixed(1),
        totalReviews: sellerReviews.length,
      },
    });

    res.json({
      success: true,
      message: "Review deleted successfully!",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
