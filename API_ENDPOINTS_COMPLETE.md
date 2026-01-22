# 🚀 MKET API Endpoints - Complete Documentation

**Base URL:** `http://localhost:3000/api`

---

## 📝 **TABLE OF CONTENTS**

1. [Authentication Endpoints](#authentication-endpoints)
2. [Product Endpoints](#product-endpoints)
3. [Wishlist Endpoints](#wishlist-endpoints)
4. [Notification Endpoints](#notification-endpoints)

---

## 🔐 **AUTHENTICATION ENDPOINTS**

### 1. **Signup**

- **Route:** `POST /api/auth/signup`
- **Access:** Public
- **Description:** Register a new user account

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@futminna.edu.ng",
  "password": "SecurePass123",
  "phone": "08012345678",
  "location": "Bosso Campus"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Account created successfully!",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@futminna.edu.ng",
    "phone": "08012345678",
    "location": "Bosso Campus"
  }
}
```

### 2. **Login**

- **Route:** `POST /api/auth/login`
- **Access:** Public
- **Description:** Login to existing account

**Request Body:**

```json
{
  "email": "john@futminna.edu.ng",
  "password": "SecurePass123"
}
```

### 3. **Get Current User**

- **Route:** `GET /api/auth/me`
- **Access:** Private (requires token)
- **Description:** Get authenticated user's profile

### 4. **Update Profile**

- **Route:** `PUT /api/auth/update`
- **Access:** Private
- **Description:** Update user profile information

**Request Body:**

```json
{
  "name": "John Updated",
  "phone": "08098765432",
  "location": "Main Campus",
  "bio": "Student at FUTMINNA"
}
```

### 5. **Change Password**

- **Route:** `PUT /api/auth/change-password`
- **Access:** Private
- **Description:** Change user password

**Request Body:**

```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass456"
}
```

### 6. **Get User Profile**

- **Route:** `GET /api/auth/user/:id`
- **Access:** Public
- **Description:** Get public profile of any user

---

## 📦 **PRODUCT ENDPOINTS**

### 1. **Create Product / Save Draft**

- **Route:** `POST /api/products`
- **Access:** Private
- **Description:** Create new product or save as draft

**Request Body (Published Product):**

```json
{
  "title": "iPhone 13 Pro",
  "description": "Mint condition, barely used",
  "price": 450000,
  "originalPrice": 550000,
  "category": "electronics",
  "condition": "Used",
  "location": "Bosso Campus",
  "images": [
    {
      "public_id": "mket/product123",
      "url": "https://res.cloudinary.com/..."
    }
  ],
  "status": "available"
}
```

**Request Body (Draft):**

```json
{
  "title": "Draft Product Title",
  "description": "Partial description...",
  "price": 50000,
  "status": "draft"
}
```

### 2. **Get All Products**

- **Route:** `GET /api/products`
- **Access:** Public
- **Description:** Get all available products with filters and pagination

**Query Parameters:**

- `category` - Filter by category
- `condition` - Filter by condition (New, Used, Fairly Used)
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `location` - Filter by location
- `search` - Text search in title/description
- `sort` - Sort by (price-asc, price-desc, popular, rating, newest)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Example:**

```
GET /api/products?category=electronics&minPrice=10000&maxPrice=500000&sort=price-asc&page=1&limit=20
```

### 3. **Search Products**

- **Route:** `GET /api/products/search`
- **Access:** Public
- **Description:** Full-text search products

**Query Parameters:**

- `q` - Search query (required)
- `page` - Page number
- `limit` - Items per page

**Example:**

```
GET /api/products/search?q=laptop&page=1&limit=20
```

### 4. **Get Products by Category**

- **Route:** `GET /api/products/category/:category`
- **Access:** Public
- **Description:** Get all products in a specific category

**Example:**

```
GET /api/products/category/electronics?page=1&limit=20&sort=price-desc
```

### 5. **Get Single Product**

- **Route:** `GET /api/products/:id`
- **Access:** Public
- **Description:** Get detailed product information

### 6. **Get User's Products**

- **Route:** `GET /api/products/user/:userId`
- **Access:** Public
- **Description:** Get all products by a specific user

**Query Parameters:**

- `status` - Filter by status (available, sold, all)

**Example:**

```
GET /api/products/user/user123?status=available
```

### 7. **Get My Products (Listings)**

- **Route:** `GET /api/products/my/products`
- **Access:** Private
- **Description:** Get all products for authenticated user

**Query Parameters:**

- `status` - Filter by status (draft, available, sold, reserved, deleted, all)

**Example:**

```
GET /api/products/my/products?status=available
```

### 8. **Get My Drafts**

- **Route:** `GET /api/products/my/drafts`
- **Access:** Private
- **Description:** Get all saved drafts for authenticated user

### 9. **Update Product**

- **Route:** `PUT /api/products/:id`
- **Access:** Private (Owner only)
- **Description:** Update product details

**Request Body:**

```json
{
  "title": "Updated Title",
  "price": 400000,
  "description": "Updated description"
}
```

### 10. **Publish Draft**

- **Route:** `PUT /api/products/:id/publish`
- **Access:** Private (Owner only)
- **Description:** Publish a draft product

**Note:** All required fields must be complete before publishing

### 11. **Mark as Sold**

- **Route:** `PUT /api/products/:id/sold`
- **Access:** Private (Owner only)
- **Description:** Mark product as sold

### 12. **Delete Product**

- **Route:** `DELETE /api/products/:id`
- **Access:** Private (Owner only)
- **Description:** Soft delete (mark as deleted)

### 13. **Add Review**

- **Route:** `POST /api/products/:id/reviews`
- **Access:** Private
- **Description:** Add review to a product

**Request Body:**

```json
{
  "rating": 5,
  "comment": "Great product, very satisfied!"
}
```

---

## ❤️ **WISHLIST ENDPOINTS**

### 1. **Get Wishlist**

- **Route:** `GET /api/wishlist`
- **Access:** Private
- **Description:** Get user's wishlist with populated products

**Response:**

```json
{
  "success": true,
  "wishlist": [
    {
      "product": {
        "_id": "product_id",
        "title": "Product Name",
        "price": 50000,
        "images": [...]
      },
      "addedAt": "2026-01-22T10:30:00.000Z"
    }
  ],
  "count": 5
}
```

### 2. **Add to Wishlist**

- **Route:** `POST /api/wishlist/:productId`
- **Access:** Private
- **Description:** Add product to wishlist

### 3. **Remove from Wishlist**

- **Route:** `DELETE /api/wishlist/:productId`
- **Access:** Private
- **Description:** Remove product from wishlist

### 4. **Check Wishlist**

- **Route:** `GET /api/wishlist/check/:productId`
- **Access:** Private
- **Description:** Check if product is in wishlist

**Response:**

```json
{
  "success": true,
  "inWishlist": true
}
```

### 5. **Clear Wishlist**

- **Route:** `DELETE /api/wishlist`
- **Access:** Private
- **Description:** Clear entire wishlist

---

## 🔔 **NOTIFICATION ENDPOINTS**

### 1. **Get Notifications**

- **Route:** `GET /api/notifications`
- **Access:** Private
- **Description:** Get user's notifications with pagination

**Query Parameters:**

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `unreadOnly` - Only unread notifications (true/false)

**Example:**

```
GET /api/notifications?page=1&limit=20&unreadOnly=true
```

**Response:**

```json
{
  "success": true,
  "notifications": [
    {
      "_id": "notif_id",
      "type": "product_sold",
      "title": "Product Sold!",
      "message": "Your iPhone 13 Pro has been sold",
      "link": "/products/product_id",
      "isRead": false,
      "createdAt": "2026-01-22T10:30:00.000Z"
    }
  ],
  "unreadCount": 5,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### 2. **Mark as Read**

- **Route:** `PUT /api/notifications/:id/read`
- **Access:** Private
- **Description:** Mark single notification as read

### 3. **Mark All as Read**

- **Route:** `PUT /api/notifications/read-all`
- **Access:** Private
- **Description:** Mark all notifications as read

### 4. **Delete Notification**

- **Route:** `DELETE /api/notifications/:id`
- **Access:** Private
- **Description:** Delete single notification

### 5. **Clear All Notifications**

- **Route:** `DELETE /api/notifications`
- **Access:** Private
- **Description:** Delete all notifications

---

## 🔑 **AUTHENTICATION**

For protected routes, include JWT token in header:

```
Authorization: Bearer your_jwt_token_here
```

Frontend axios is configured to automatically add this header.

---

## 📊 **PRODUCT STATUS VALUES**

- `draft` - Saved but not published
- `available` - Published and available for sale
- `sold` - Product has been sold
- `reserved` - Product is reserved for a buyer
- `deleted` - Soft deleted (hidden from public)

---

## 🏷️ **PRODUCT CATEGORIES**

- electronics
- fashion
- books
- furniture
- sports
- beauty
- food
- services
- vehicles
- real-estate
- other

---

## 🔔 **NOTIFICATION TYPES**

- `new_message` - New chat message received
- `product_sold` - Product has been sold
- `product_review` - Product received a review
- `product_like` - Product was liked
- `price_drop` - Price drop on wishlisted item
- `new_follower` - New follower
- `system` - System notification

---

## ✅ **SUCCESS RESPONSES**

All successful responses include:

```json
{
  "success": true,
  "message": "...",
  "data": {...}
}
```

## ❌ **ERROR RESPONSES**

All error responses include:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

---

## 🚀 **QUICK START**

1. **Register:** `POST /api/auth/signup`
2. **Login:** `POST /api/auth/login` → Save token
3. **Create Product:** `POST /api/products` (with token)
4. **Get Products:** `GET /api/products`
5. **Add to Wishlist:** `POST /api/wishlist/:productId` (with token)

---

**Last Updated:** January 22, 2026  
**Version:** 2.0.0
