import Wishlist from "../model/Wishlist.js";
import Product from "../model/Product.js";

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate({
      path: "products.product",
      select: "title price images category location status seller",
      populate: {
        path: "seller",
        select: "name avatar verified",
      },
    });

    // Create wishlist if it doesn't exist
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [] });
    }

    res.json({
      success: true,
      wishlist: wishlist.products,
      count: wishlist.products.length,
    });
  } catch (error) {
    console.error("❌ Get wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get wishlist",
      error: error.message,
    });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Get or create wishlist
    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [] });
    }

    // Check if product already in wishlist
    const alreadyAdded = wishlist.products.some(
      (item) => item.product.toString() === productId
    );

    if (alreadyAdded) {
      return res.status(400).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    // Add product to wishlist
    wishlist.products.unshift({ product: productId });
    await wishlist.save();

    res.json({
      success: true,
      message: "Product added to wishlist",
      wishlist: wishlist.products,
    });
  } catch (error) {
    console.error("❌ Add to wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add to wishlist",
      error: error.message,
    });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    // Remove product from wishlist
    wishlist.products = wishlist.products.filter(
      (item) => item.product.toString() !== productId
    );

    await wishlist.save();

    res.json({
      success: true,
      message: "Product removed from wishlist",
      wishlist: wishlist.products,
    });
  } catch (error) {
    console.error("❌ Remove from wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove from wishlist",
      error: error.message,
    });
  }
};

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
export const clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    wishlist.products = [];
    await wishlist.save();

    res.json({
      success: true,
      message: "Wishlist cleared successfully",
    });
  } catch (error) {
    console.error("❌ Clear wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear wishlist",
      error: error.message,
    });
  }
};

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
export const checkWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return res.json({
        success: true,
        inWishlist: false,
      });
    }

    const inWishlist = wishlist.products.some(
      (item) => item.product.toString() === productId
    );

    res.json({
      success: true,
      inWishlist,
    });
  } catch (error) {
    console.error("❌ Check wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check wishlist",
      error: error.message,
    });
  }
};
