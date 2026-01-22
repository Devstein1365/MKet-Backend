import Product from "../model/Product.js";
import User from "../model/User.js";

// @desc    Create new product
// @route   POST /api/products
// @access  Private
export const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      originalPrice,
      condition,
      category,
      location,
      images,
    } = req.body;

    // Validate required fields
    if (!title || !description || !price || !category || !location) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Validate images
    if (!images || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one image",
      });
    }

    // Create product
    const product = await Product.create({
      title,
      description,
      price,
      originalPrice: originalPrice || null,
      condition: condition || "Used",
      category,
      location,
      images,
      seller: req.user.id,
    });

    // Update user's total listings count
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { totalListings: 1 },
    });

    // Populate seller info
    await product.populate("seller", "name avatar verified rating");

    res.status(201).json({
      success: true,
      message: "Product created successfully!",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const {
      category,
      condition,
      minPrice,
      maxPrice,
      location,
      search,
      sort,
      page = 1,
      limit = 20,
    } = req.query;

    // Build query
    const query = { status: "available" };

    if (category) query.category = category;
    if (condition) query.condition = condition;
    if (location) query.location = new RegExp(location, "i");

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Sort options
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sort === "price-asc") sortOption = { price: 1 };
    if (sort === "price-desc") sortOption = { price: -1 };
    if (sort === "popular") sortOption = { views: -1 };
    if (sort === "rating") sortOption = { averageRating: -1 };

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query
    const products = await Product.find(query)
      .sort(sortOption)
      .limit(Number(limit))
      .skip(skip)
      .populate("seller", "name avatar verified rating");

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get products",
      error: error.message,
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate(
        "seller",
        "name email phone location avatar verified rating totalListings createdAt"
      )
      .populate("reviews.user", "name avatar");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Increment view count
    product.views += 1;
    await product.save();

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get product",
      error: error.message,
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
export const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check ownership
    if (
      product.seller.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this product",
      });
    }

    const {
      title,
      description,
      price,
      originalPrice,
      condition,
      category,
      location,
      images,
      status,
    } = req.body;

    // Update fields
    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = price;
    if (originalPrice !== undefined) product.originalPrice = originalPrice;
    if (condition) product.condition = condition;
    if (category) product.category = category;
    if (location) product.location = location;
    if (images) product.images = images;
    if (status) product.status = status;

    await product.save();

    await product.populate("seller", "name avatar verified rating");

    res.status(200).json({
      success: true,
      message: "Product updated successfully!",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check ownership
    if (
      product.seller.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this product",
      });
    }

    // Soft delete - mark as deleted
    product.status = "deleted";
    await product.save();

    // Update user's total listings count
    await User.findByIdAndUpdate(product.seller, {
      $inc: { totalListings: -1 },
    });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully!",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

// @desc    Get user's products
// @route   GET /api/products/user/:userId
// @access  Public
export const getUserProducts = async (req, res) => {
  try {
    const { status = "available" } = req.query;

    const query = {
      seller: req.params.userId,
    };

    if (status !== "all") {
      query.status = status;
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .populate("seller", "name avatar verified rating");

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get user products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user products",
      error: error.message,
    });
  }
};

// @desc    Add review to product
// @route   POST /api/products/:id/reviews
// @access  Private
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating) {
      return res.status(400).json({
        success: false,
        message: "Please provide a rating",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      (review) => review.user.toString() === req.user.id
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    // Add review
    product.reviews.push({
      user: req.user.id,
      rating: Number(rating),
      comment: comment || "",
    });

    await product.save();

    await product.populate("reviews.user", "name avatar");

    res.status(201).json({
      success: true,
      message: "Review added successfully!",
      product,
    });
  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add review",
      error: error.message,
    });
  }
};

// @desc    Mark product as sold
// @route   PUT /api/products/:id/sold
// @access  Private
export const markAsSold = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check ownership
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    product.status = "sold";
    await product.save();

    // Update seller's sold count
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { totalSold: 1 },
    });

    res.status(200).json({
      success: true,
      message: "Product marked as sold!",
      product,
    });
  } catch (error) {
    console.error("Mark as sold error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};
