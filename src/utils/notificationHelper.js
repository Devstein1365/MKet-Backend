// ===================================
// NOTIFICATION UTILITY
// ===================================
// Helper functions to create notifications
// ===================================

import prisma from "../config/prisma.js";

// ===================================
// CREATE NOTIFICATION
// ===================================
export const createNotification = async ({
  userId,
  type,
  title,
  message,
  relatedId = null,
  relatedType = null,
}) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        relatedId,
        relatedType,
      },
    });

    return notification;
  } catch (error) {
    console.error("Create notification error:", error);
    return null;
  }
};

// ===================================
// NOTIFICATION TEMPLATES
// ===================================

// New message notification
export const notifyNewMessage = async (userId, senderName, conversationId) => {
  return createNotification({
    userId,
    type: "NEW_MESSAGE",
    title: "New Message",
    message: `${senderName} sent you a message`,
    relatedId: conversationId,
    relatedType: "CONVERSATION",
  });
};

// Product sold notification
export const notifyProductSold = async (userId, productTitle, productId) => {
  return createNotification({
    userId,
    type: "PRODUCT_SOLD",
    title: "Product Sold!",
    message: `Your product "${productTitle}" has been marked as sold`,
    relatedId: productId,
    relatedType: "PRODUCT",
  });
};

// Product liked/wishlisted notification
export const notifyProductLiked = async (userId, userName, productTitle) => {
  return createNotification({
    userId,
    type: "PRODUCT_LIKED",
    title: "Product Added to Wishlist",
    message: `${userName} added your product "${productTitle}" to their wishlist`,
    relatedType: "PRODUCT",
  });
};

// New review notification
export const notifyNewReview = async (
  userId,
  reviewerName,
  rating,
  productTitle,
) => {
  return createNotification({
    userId,
    type: "NEW_REVIEW",
    title: "New Review",
    message: `${reviewerName} gave you a ${rating}-star review for "${productTitle}"`,
    relatedType: "REVIEW",
  });
};

// Price drop notification (future feature)
export const notifyPriceDrop = async (
  userId,
  productTitle,
  newPrice,
  productId,
) => {
  return createNotification({
    userId,
    type: "PRICE_DROP",
    title: "Price Drop Alert!",
    message: `"${productTitle}" is now ₦${newPrice}`,
    relatedId: productId,
    relatedType: "PRODUCT",
  });
};

export default {
  createNotification,
  notifyNewMessage,
  notifyProductSold,
  notifyProductLiked,
  notifyNewReview,
  notifyPriceDrop,
};
