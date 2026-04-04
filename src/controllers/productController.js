// ===================================
// PRODUCTS CONTROLLER
// ===================================
// Handles all product operations:
// - Create, read, update, delete products
// - Product filtering and pagination
// - Mark as sold
// - Increment views
// - Product reviews
// ===================================

import prisma from "../config/prisma.js";

// ===================================
// GET ALL PRODUCTS (WITH FILTERS)
// ===================================
// GET /api/products?category=electronics&condition=new&minPrice=1000&maxPrice=50000&location=MM Castle&search=iphone&sort=newest&page=1&limit=20
// Public route
export const getAllProducts = async (req, res) => {
  try {
    const {
      category,
      condition,
      minPrice,
      maxPrice,
      location,
      search,
      sort = "newest",
      page = 1,
      limit = 20,
    } = req.query;

    // Build where clause for filtering
    const where = {};

    // By default, only show AVAILABLE or RESERVED products in general search
    // but if specifically looking for SOLD/ARCHIVED, allow it if status is provided
    if (req.query.status) {
      where.status = req.query.status.toUpperCase();
    } else {
      where.status = { in: ["AVAILABLE", "RESERVED"] };
    }

    if (category) {
      where.category = category;
    }

    if (condition) {
      where.condition = condition.toUpperCase();
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseInt(minPrice);
      if (maxPrice) where.price.lte = parseInt(maxPrice);
    }

    if (location) {
      where.location = location;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build orderBy clause for sorting
    let orderBy = {};
    switch (sort) {
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "price-low":
        orderBy = { price: "asc" };
        break;
      case "price-high":
        orderBy = { price: "desc" };
        break;
      case "popular":
        orderBy = { views: "desc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get products with seller information
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
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
      }),
      prisma.product.count({ where }),
    ]);

    // Format products (convert price from kobo to naira for display)
    const formattedProducts = products.map((product) => ({
      ...product,
      images: JSON.parse(product.images), // Parse images JSON string
      price: product.price / 100, // Convert kobo to naira
      originalPrice: product.originalPrice ? product.originalPrice / 100 : null,
    }));

    res.json({
      success: true,
      products: formattedProducts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load products",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// GET PRODUCT BY ID
// ===================================
// GET /api/products/:id
// Public route
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            fullName: true,
            studentId: true,
            avatarUrl: true,
            avatarColor: true,
            isVerified: true,
            bio: true,
            location: true,
            totalListings: true,
            totalSold: true,
            averageRating: true,
            createdAt: true,
          },
        },
        reviews: {
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
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Format product (convert price from kobo to naira)
    const formattedProduct = {
      ...product,
      images: JSON.parse(product.images), // Parse images JSON string
      price: product.price / 100,
      originalPrice: product.originalPrice ? product.originalPrice / 100 : null,
    };

    res.json({
      success: true,
      product: formattedProduct,
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Product not found",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// CREATE PRODUCT
// ===================================
// POST /api/products
// Body: { title, description, images[], category, condition, price, originalPrice, location, status }
// Requires: Authentication
export const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      images,
      category,
      condition,
      price,
      originalPrice,
      location,
      status = "AVAILABLE",
      aiGenerated = false,
    } = req.body;

    // Validation
    if (!title || !category || !condition || !price || !location) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (!images || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one image",
      });
    }

    if (images.length > 6) {
      return res.status(400).json({
        success: false,
        message: "Maximum 6 images allowed",
      });
    }

    // Validate condition
    const validConditions = ["NEW", "USED", "FAIRLY_USED"];
    if (!validConditions.includes(condition.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid condition. Must be NEW, USED, or FAIRLY_USED",
      });
    }

    // Validate status
    const validStatuses = [
      "DRAFT",
      "AVAILABLE",
      "RESERVED",
      "SOLD",
      "ARCHIVED",
    ];
    if (status && !validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Must be DRAFT, AVAILABLE, RESERVED, SOLD, or ARCHIVED",
      });
    }

    // Convert price from naira to kobo (for storage)
    const priceInKobo = Math.round(parseFloat(price) * 100);
    const originalPriceInKobo = originalPrice
      ? Math.round(parseFloat(originalPrice) * 100)
      : null;

    // Create product
    const product = await prisma.product.create({
      data: {
        sellerId: req.userId,
        title,
        description,
        images: JSON.stringify(images), // Store as JSON array
        category,
        condition: condition.toUpperCase(),
        price: priceInKobo,
        originalPrice: originalPriceInKobo,
        location,
        status: (status || "AVAILABLE").toUpperCase(),
        aiGenerated,
        moderationPassed: true, // TODO: Implement AI moderation
      },
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
    });

    // Update user's total listings count
    await prisma.user.update({
      where: { id: req.userId },
      data: {
        totalListings: {
          increment: 1,
        },
      },
    });

    // Format product for response
    const formattedProduct = {
      ...product,
      images: JSON.parse(product.images),
      price: product.price / 100,
      originalPrice: product.originalPrice ? product.originalPrice / 100 : null,
    };

    res.status(201).json({
      success: true,
      message:
        status === "DRAFT"
          ? "Product saved as draft!"
          : "Product posted successfully!",
      product: formattedProduct,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// UPDATE PRODUCT
// ===================================
// PUT /api/products/:id
// Body: { title, description, images[], category, condition, price, originalPrice, location, status }
// Requires: Authentication + Ownership
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      images,
      category,
      condition,
      price,
      originalPrice,
      location,
      status,
    } = req.body;

    // Check if product exists and belongs to user
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (existingProduct.sellerId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this product",
      });
    }

    // Build update data
    const updateData = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (images) updateData.images = JSON.stringify(images);
    if (category) updateData.category = category;
    if (condition) updateData.condition = condition.toUpperCase();
    if (location) updateData.location = location;

    if (status) {
      const validStatuses = [
        "DRAFT",
        "AVAILABLE",
        "RESERVED",
        "SOLD",
        "ARCHIVED",
      ];
      if (!validStatuses.includes(status.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid status. Must be DRAFT, AVAILABLE, RESERVED, SOLD, or ARCHIVED",
        });
      }
      updateData.status = status.toUpperCase();

      // Update user's total sold count if status is changing to SOLD
      if (
        status.toUpperCase() === "SOLD" &&
        existingProduct.status !== "SOLD"
      ) {
        updateData.soldAt = new Date();
        await prisma.user.update({
          where: { id: req.userId },
          data: { totalSold: { increment: 1 } },
        });
      }
      // Decrement total sold if it was SOLD and changing back
      if (
        status.toUpperCase() !== "SOLD" &&
        existingProduct.status === "SOLD"
      ) {
        updateData.soldAt = null;
        await prisma.user.update({
          where: { id: req.userId },
          data: { totalSold: { decrement: 1 } },
        });
      }
    }

    // Convert prices to kobo if provided
    if (price) {
      updateData.price = Math.round(parseFloat(price) * 100);
    }
    if (originalPrice !== undefined) {
      updateData.originalPrice = originalPrice
        ? Math.round(parseFloat(originalPrice) * 100)
        : null;
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
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
    });

    // Format product for response
    const formattedProduct = {
      ...product,
      images: JSON.parse(product.images),
      price: product.price / 100,
      originalPrice: product.originalPrice ? product.originalPrice / 100 : null,
    };

    res.json({
      success: true,
      message: "Product updated successfully!",
      product: formattedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// DELETE PRODUCT (SOFT DELETE)
// ===================================
// DELETE /api/products/:id
// Requires: Authentication + Ownership
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists and belongs to user
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.sellerId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this product",
      });
    }

    // Soft delete by setting status to SOLD (or you could add a DELETED status)
    await prisma.product.delete({
      where: { id },
    });

    // Update user's total listings count
    await prisma.user.update({
      where: { id: req.userId },
      data: {
        totalListings: {
          decrement: 1,
        },
      },
    });

    res.json({
      success: true,
      message: "Product deleted successfully!",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// GET USER'S PRODUCTS
// ===================================
// GET /api/products/user/:userId?status=available
// Public route
export const getUserProducts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status = "available" } = req.query;

    const where = { sellerId: userId };

    if (status === "available") {
      where.status = "AVAILABLE";
    } else if (status === "sold") {
      where.status = "SOLD";
    } else if (status === "draft") {
      where.status = "DRAFT";
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
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
    });

    // Format products
    const formattedProducts = products.map((product) => ({
      ...product,
      images: JSON.parse(product.images),
      price: product.price / 100,
      originalPrice: product.originalPrice ? product.originalPrice / 100 : null,
    }));

    res.json({
      success: true,
      products: formattedProducts,
    });
  } catch (error) {
    console.error("Get user products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load products",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// GET MY PRODUCTS
// ===================================
// GET /api/products/my-products?status=available
// Requires: Authentication
export const getMyProducts = async (req, res) => {
  try {
    const { status } = req.query;

    const where = { sellerId: req.userId };

    if (status) {
      where.status = status.toUpperCase();
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
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
    });

    // Format products
    const formattedProducts = products.map((product) => ({
      ...product,
      images: JSON.parse(product.images),
      price: product.price / 100,
      originalPrice: product.originalPrice ? product.originalPrice / 100 : null,
    }));

    res.json({
      success: true,
      products: formattedProducts,
    });
  } catch (error) {
    console.error("Get my products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load products",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// MARK PRODUCT AS SOLD
// ===================================
// PUT /api/products/:id/mark-sold
// Requires: Authentication + Ownership
export const markAsSold = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists and belongs to user
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.sellerId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this product",
      });
    }

    // Update product status
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { status: "SOLD" },
    });

    // Update user's total sold count
    await prisma.user.update({
      where: { id: req.userId },
      data: {
        totalSold: {
          increment: 1,
        },
      },
    });

    // Format product
    const formattedProduct = {
      ...updatedProduct,
      images: JSON.parse(updatedProduct.images),
      price: updatedProduct.price / 100,
      originalPrice: updatedProduct.originalPrice
        ? updatedProduct.originalPrice / 100
        : null,
    };

    res.json({
      success: true,
      message: "Product marked as sold!",
      product: formattedProduct,
    });
  } catch (error) {
    console.error("Mark as sold error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark product as sold",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// INCREMENT PRODUCT VIEWS
// ===================================
// POST /api/products/:id/increment-views
// Public route (no auth needed for viewing)
export const incrementViews = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    // Also increment seller's total views
    const product = await prisma.product.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (product) {
      await prisma.user.update({
        where: { id: product.sellerId },
        data: {
          totalViews: {
            increment: 1,
          },
        },
      });
    }

    res.json({
      success: true,
    });
  } catch (error) {
    console.error("Increment views error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to increment views",
    });
  }
};
