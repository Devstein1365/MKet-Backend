import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide product title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide product description"],
      maxlength: [2000, "Description cannot be more than 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please provide product price"],
      min: [0, "Price cannot be negative"],
    },
    originalPrice: {
      type: Number,
      min: [0, "Original price cannot be negative"],
      default: null,
    },
    condition: {
      type: String,
      required: [true, "Please specify product condition"],
      enum: ["New", "Used", "Fairly Used"],
      default: "Used",
    },
    category: {
      type: String,
      required: [true, "Please select a category"],
      enum: [
        "electronics",
        "fashion",
        "books",
        "furniture",
        "sports",
        "beauty",
        "food",
        "services",
        "vehicles",
        "real-estate",
        "other",
      ],
    },
    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    location: {
      type: String,
      required: [true, "Please provide location"],
      trim: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Engagement metrics
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    // Status
    status: {
      type: String,
      enum: ["draft", "available", "sold", "reserved", "deleted"],
      default: "available",
    },
    // Featured/Premium
    isFeatured: {
      type: Boolean,
      default: false,
    },
    // Reviews
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          maxlength: [500, "Review cannot be more than 500 characters"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
productSchema.index({ category: 1, status: 1 });
productSchema.index({ seller: 1, status: 1 });
productSchema.index({ title: "text", description: "text" }); // Text search

// Calculate average rating before saving
productSchema.pre("save", function (next) {
  if (this.reviews.length > 0) {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.averageRating = sum / this.reviews.length;
    this.totalReviews = this.reviews.length;
  }
  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;
