// ===================================
// CHAT CONTROLLER
// ===================================
// Handles chat/messaging REST operations
// Real-time messaging handled by Socket.io
// ===================================

import prisma from "../config/prisma.js";

// ===================================
// CREATE OR GET CONVERSATION
// ===================================
// POST /api/conversations
// Body: { participantId, productId }
// Requires: Authentication
export const createOrGetConversation = async (req, res) => {
  try {
    const { participantId, productId } = req.body;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: "Please provide participantId",
      });
    }

    // Don't allow users to message themselves
    if (participantId === req.userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot message yourself",
      });
    }

    // Check if participant exists
    const participant = await prisma.user.findUnique({
      where: { id: participantId },
    });

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if product exists (if provided)
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
    }

    // Check if conversation already exists between these two users
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          {
            AND: [{ user1Id: req.userId }, { user2Id: participantId }],
          },
          {
            AND: [{ user1Id: participantId }, { user2Id: req.userId }],
          },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            avatarColor: true,
            isVerified: true,
          },
        },
        user2: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            avatarColor: true,
            isVerified: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            images: true,
            price: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    // Create new conversation if doesn't exist
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          user1Id: req.userId,
          user2Id: participantId,
          productId: productId || null,
        },
        include: {
          user1: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              avatarColor: true,
              isVerified: true,
            },
          },
          user2: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              avatarColor: true,
              isVerified: true,
            },
          },
          product: {
            select: {
              id: true,
              title: true,
              images: true,
              price: true,
            },
          },
          messages: true,
        },
      });
    }

    // Format product images and price
    if (conversation.product) {
      conversation.product = {
        ...conversation.product,
        images: JSON.parse(conversation.product.images),
        price: conversation.product.price / 100,
      };
    }

    res.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("Create conversation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create conversation",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// GET USER'S CONVERSATIONS
// ===================================
// GET /api/conversations
// Requires: Authentication
export const getConversations = async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: req.userId }, { user2Id: req.userId }],
      },
      include: {
        user1: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            avatarColor: true,
            isVerified: true,
          },
        },
        user2: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            avatarColor: true,
            isVerified: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            images: true,
            price: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Format conversations with participant info and unread count
    const formattedConversations = await Promise.all(
      conversations.map(async (conv) => {
        // Get the other participant
        const participant =
          conv.user1Id === req.userId ? conv.user2 : conv.user1;

        // Count unread messages
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: participant.id,
            isRead: false,
          },
        });

        // Format product if exists
        let product = null;
        if (conv.product) {
          product = {
            ...conv.product,
            images: JSON.parse(conv.product.images),
            price: conv.product.price / 100,
          };
        }

        return {
          id: conv.id,
          participant,
          product,
          lastMessage: conv.messages[0] || null,
          unreadCount,
          updatedAt: conv.updatedAt,
        };
      }),
    );

    res.json({
      success: true,
      conversations: formattedConversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load conversations",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// GET CONVERSATION BY ID
// ===================================
// GET /api/conversations/:id
// Requires: Authentication
export const getConversationById = async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        user1: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            avatarColor: true,
            isVerified: true,
          },
        },
        user2: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            avatarColor: true,
            isVerified: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            images: true,
            price: true,
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Check if user is participant
    if (
      conversation.user1Id !== req.userId &&
      conversation.user2Id !== req.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this conversation",
      });
    }

    // Format product if exists
    if (conversation.product) {
      conversation.product = {
        ...conversation.product,
        images: JSON.parse(conversation.product.images),
        price: conversation.product.price / 100,
      };
    }

    res.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("Get conversation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load conversation",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// GET MESSAGES
// ===================================
// GET /api/conversations/:id/messages?page=1&limit=50
// Requires: Authentication
export const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if user is participant
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: { user1Id: true, user2Id: true },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    if (
      conversation.user1Id !== req.userId &&
      conversation.user2Id !== req.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this conversation",
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId: id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.message.count({ where: { conversationId: id } }),
    ]);

    res.json({
      success: true,
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load messages",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// SEND MESSAGE (REST)
// ===================================
// POST /api/messages
// Body: { conversationId, text }
// Requires: Authentication
// Note: For real-time, use Socket.io instead
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    // Check if user is participant
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { user1Id: true, user2Id: true },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    if (
      conversation.user1Id !== req.userId &&
      conversation.user2Id !== req.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this conversation",
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: req.userId,
        text,
      },
    });

    // Update conversation updated time
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// MARK MESSAGE AS READ
// ===================================
// PUT /api/messages/:id/read
// Requires: Authentication
export const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        conversation: {
          select: { user1Id: true, user2Id: true },
        },
      },
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Only the recipient can mark as read
    if (message.senderId === req.userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot mark your own message as read",
      });
    }

    // Check if user is participant
    if (
      message.conversation.user1Id !== req.userId &&
      message.conversation.user2Id !== req.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this message",
      });
    }

    const updatedMessage = await prisma.message.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({
      success: true,
      message: updatedMessage,
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark as read",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ===================================
// MARK ALL MESSAGES AS READ
// ===================================
// PUT /api/conversations/:id/mark-all-read
// Requires: Authentication
export const markAllMessagesAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is participant
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: { user1Id: true, user2Id: true },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    if (
      conversation.user1Id !== req.userId &&
      conversation.user2Id !== req.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this conversation",
      });
    }

    // Get the other participant's ID
    const otherUserId =
      conversation.user1Id === req.userId
        ? conversation.user2Id
        : conversation.user1Id;

    // Mark all messages from the other user as read
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: otherUserId,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({
      success: true,
      message: "All messages marked as read",
    });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
