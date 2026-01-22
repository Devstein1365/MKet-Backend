import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "new_message",
        "product_sold",
        "product_review",
        "product_like",
        "price_drop",
        "new_follower",
        "system",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    message: {
      type: String,
      required: true,
      maxlength: [500, "Message cannot be more than 500 characters"],
    },
    link: {
      type: String,
      default: null,
    },
    relatedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
