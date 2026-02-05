// ===================================
// WISHLIST CONTROLLER
// ===================================
// Handles user wishlist operations
// ===================================

import prisma from "../config/prisma.js";

// ===================================
// GET USER'S WISHLIST
// ===================================
// GET /api/wishlist
// Requires: Authentication
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await prisma.wishlistItem.findMany({
      where: { userId: req.userId },
      include: {
        product: {
          include: {
            seller: {
              select: {
                id: true,
                fullName: true,
                studentId: true,
                avatarUrl: true,
                avatarColor: true,
                isVerified: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format products (convert price from kobo to naira)
    const formattedWishlist = wishlist.map((item) => ({
      ...item,
      product: {
        ...item.product,
        images: JSON.parse(item.product.images),
        price: item.product.price / 100,
        originalPrice: item.product.originalPrice
          ? item.product.originalPrice / 100
          : null,
      },
    }));

    res.json({
      success: true,
      wishlist: formattedWishlist,
      count: formattedWishlist.length,
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load wishlist",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// ADD TO WISHLIST
// ===================================
// POST /api/wishlist/:productId
// Requires: Authentication
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if already in wishlist
    const existing = await prisma.wishlistItem.findFirst({
      where: {
        userId: req.userId,
        productId,
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    // Add to wishlist
    await prisma.wishlistItem.create({
      data: {
        userId: req.userId,
        productId,
      },
    });

    // Get updated wishlist
    const wishlist = await prisma.wishlistItem.findMany({
      where: { userId: req.userId },
      include: {
        product: {
          include: {
            seller: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                avatarColor: true,
                isVerified: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format wishlist
    const formattedWishlist = wishlist.map((item) => ({
      ...item,
      product: {
        ...item.product,
        images: JSON.parse(item.product.images),
        price: item.product.price / 100,
        originalPrice: item.product.originalPrice
          ? item.product.originalPrice / 100
          : null,
      },
    }));

    res.json({
      success: true,
      message: "Added to wishlist!",
      wishlist: formattedWishlist,
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add to wishlist",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// REMOVE FROM WISHLIST
// ===================================
// DELETE /api/wishlist/:productId
// Requires: Authentication
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Find and delete wishlist item
    const wishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        userId: req.userId,
        productId,
      },
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: "Product not in wishlist",
      });
    }

    await prisma.wishlistItem.delete({
      where: { id: wishlistItem.id },
    });

    res.json({
      success: true,
      message: "Removed from wishlist!",
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove from wishlist",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// CHECK IF IN WISHLIST
// ===================================
// GET /api/wishlist/check/:productId
// Requires: Authentication
export const checkWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        userId: req.userId,
        productId,
      },
    });

    res.json({
      success: true,
      inWishlist: !!wishlistItem,
    });
  } catch (error) {
    console.error("Check wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check wishlist",
      inWishlist: false,
    });
  }
};

// ===================================
// CLEAR WISHLIST
// ===================================
// DELETE /api/wishlist
// Requires: Authentication
export const clearWishlist = async (req, res) => {
  try {
    await prisma.wishlistItem.deleteMany({
      where: { userId: req.userId },
    });

    res.json({
      success: true,
      message: "Wishlist cleared!",
    });
  } catch (error) {
    console.error("Clear wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear wishlist",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
