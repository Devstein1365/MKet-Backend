# MKET Backend Implementation Plan

## 📊 Frontend Analysis Complete

### API Endpoints Required:

---

## Phase 2: User Profile 👤

### Already Implemented in Auth:

✅ GET /api/auth/me - Get current user
✅ PUT /api/auth/update - Update profile (bio, location, phone, avatar)
✅ PUT /api/auth/change-password - Change password

### Additional Profile Endpoints Needed:

- PUT /api/auth/settings - Update notification settings

---

## Phase 3: Products 📦

### Endpoints Required:

**Public Endpoints:**

- GET /api/products - Get all products with filters
  - Query params: category, condition, minPrice, maxPrice, location, search, sort, page, limit
  - Response: { success, products[], pagination: { page, limit, total, totalPages } }

- GET /api/products/:id - Get product by ID
  - Response: { success, product }

**Protected Endpoints (require auth):**

- POST /api/products - Create new product
  - Body: { title, description, images[], category, condition, price, originalPrice, location, status (draft/available) }
  - Response: { success, message, product }

- GET /api/products/user/:userId - Get user's products
  - Query: status (available/sold/draft)
  - Response: { success, products[] }

- GET /api/products/my-products - Get current user's products
  - Query: status (available/sold/draft)
  - Response: { success, products[] }

- PUT /api/products/:id - Update product
  - Body: { title, description, images[], category, condition, price, originalPrice, location, status }
  - Response: { success, message, product }

- DELETE /api/products/:id - Soft delete product
  - Response: { success, message }

- PUT /api/products/:id/mark-sold - Mark product as sold
  - Response: { success, message, product }

- POST /api/products/:id/increment-views - Increment view count
  - Response: { success }

### Product Review Endpoints:

- POST /api/products/:id/reviews - Add review (after product sold)
  - Body: { rating, comment }
  - Response: { success, message, review }

- GET /api/products/:id/reviews - Get product reviews
  - Response: { success, reviews[] }

- DELETE /api/reviews/:id - Delete review (own reviews only)
  - Response: { success, message }

---

## Phase 4: Real-time Chat 💬

### REST Endpoints:

- POST /api/conversations - Create/get conversation
  - Body: { participantId, productId }
  - Response: { success, conversation }

- GET /api/conversations - Get user's conversations
  - Response: { success, conversations[] }

- GET /api/conversations/:id - Get conversation by ID
  - Response: { success, conversation, messages[] }

- GET /api/conversations/:id/messages - Get messages
  - Query: page, limit
  - Response: { success, messages[], pagination }

- POST /api/messages - Send message
  - Body: { conversationId, text }
  - Response: { success, message }

- PUT /api/messages/:id/read - Mark message as read
  - Response: { success, message }

- PUT /api/conversations/:id/mark-all-read - Mark all messages as read
  - Response: { success }

### Socket.io Events:

- connect - User connects to socket
- disconnect - User disconnects
- join_conversation - Join conversation room
- send_message - Send real-time message
- message_received - Receive real-time message
- message_read - Message read notification
- typing - User typing indicator
- stop_typing - Stop typing indicator
- user_online - User online status
- user_offline - User offline status

---

## Phase 5: Supporting Features ⭐

### Wishlist:

- GET /api/wishlist - Get user's wishlist
  - Response: { success, wishlist[], count }

- POST /api/wishlist/:productId - Add to wishlist
  - Response: { success, message, wishlist }

- DELETE /api/wishlist/:productId - Remove from wishlist
  - Response: { success, message }

- GET /api/wishlist/check/:productId - Check if in wishlist
  - Response: { success, inWishlist: true/false }

- DELETE /api/wishlist - Clear all wishlist
  - Response: { success, message }

### Notifications:

- GET /api/notifications - Get notifications
  - Query: page, limit, unreadOnly
  - Response: { success, notifications[], unreadCount, pagination }

- PUT /api/notifications/:id/read - Mark as read
  - Response: { success, message, notification }

- PUT /api/notifications/read-all - Mark all as read
  - Response: { success, message }

- DELETE /api/notifications/:id - Delete notification
  - Response: { success, message }

- DELETE /api/notifications - Clear all notifications
  - Response: { success, message }

### Reports:

- POST /api/reports - Create report
  - Body: { reportedUserId OR reportedProductId, reason, description }
  - Response: { success, message, report }

- GET /api/reports - Get user's reports (or admin view all)
  - Response: { success, reports[] }

- PUT /api/reports/:id - Update report status (admin only)
  - Body: { status, adminNotes }
  - Response: { success, message, report }

---

## 🗂️ File Structure to Create:

```
Backend/src/
├── controllers/
│   ├── authController.js ✅ (done)
│   ├── productController.js (create)
│   ├── chatController.js (create)
│   ├── wishlistController.js (create)
│   ├── notificationController.js (create)
│   ├── reviewController.js (create)
│   └── reportController.js (create)
├── middleware/
│   ├── auth.js ✅ (done)
│   ├── upload.js (create - Cloudinary integration)
│   └── validation.js (create - input validation)
├── routes/
│   ├── authRoutes.js ✅ (done)
│   ├── productRoutes.js (create)
│   ├── chatRoutes.js (create)
│   ├── wishlistRoutes.js (create)
│   ├── notificationRoutes.js (create)
│   ├── reviewRoutes.js (create)
│   └── reportRoutes.js (create)
├── socket/
│   └── chatSocket.js (create - Socket.io handlers)
└── utils/
    ├── emailService.js ✅ (done)
    ├── cloudinary.js (create - Cloudinary helper)
    ├── gemini.js (create - AI moderation)
    └── notifications.js (create - notification creator)
```

---

## 📋 Implementation Order:

### Step 1: Settings Endpoint (Quick Win)

- Add PUT /api/auth/settings to authController

### Step 2: Products System (Priority)

- Create productController.js
- Create productRoutes.js
- Create upload middleware (Cloudinary)
- Test with frontend PostItem.jsx

### Step 3: Wishlist (Simple)

- Create wishlistController.js
- Create wishlistRoutes.js
- Test with frontend Wishlist page

### Step 4: Reviews (Simple)

- Create reviewController.js
- Create reviewRoutes.js (can merge with products)
- Test review creation and display

### Step 5: Chat System (Complex)

- Create chatController.js
- Create chatRoutes.js
- Setup Socket.io in server.js
- Create chatSocket.js
- Test real-time messaging

### Step 6: Notifications (Medium)

- Create notificationController.js
- Create notificationRoutes.js
- Create notification utility
- Integrate with other features (products sold, messages, etc.)

### Step 7: Reports (Simple)

- Create reportController.js
- Create reportRoutes.js
- Test report creation

---

## 🔧 Additional Utilities Needed:

### Cloudinary Integration:

- Upload single image
- Upload multiple images
- Delete image
- AI moderation check (optional - check for inappropriate content)

### Gemini AI:

- Generate product description based on:
  - Title, category, condition, price, location
  - Images (analyze images for better descriptions)

### Notification System:

- Create notification helper
- Types: NEW_MESSAGE, PRODUCT_SOLD, PRODUCT_LIKED, NEW_REVIEW, PRICE_DROP
- Send via:
  - In-app notification (database)
  - Email (optional, using existing emailService)
  - Real-time (Socket.io)

---

## ⚙️ Environment Variables Needed:

Already in .env:
✅ CLOUDINARY_CLOUD_NAME
✅ CLOUDINARY_API_KEY
✅ CLOUDINARY_API_SECRET

Need to add:

- GEMINI_API_KEY (for AI features)

---

## 🚀 Ready to Start!

Let's begin with Step 1 and work systematically through each phase.
