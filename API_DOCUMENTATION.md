# MKET Backend API Documentation

**Base URL:** `http://localhost:3000/api`  
**Version:** 1.0.0

---

## 📋 **Authentication Endpoints**

### 1. **Sign Up**

Create a new user account.

**Endpoint:** `POST /api/auth/signup`  
**Access:** Public

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone": "08012345678",
  "location": "Bosso Campus"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Account created successfully!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "08012345678",
    "location": "Bosso Campus",
    "bio": "",
    "avatar": { "public_id": "", "url": "" },
    "verified": false,
    "totalListings": 0,
    "totalSold": 0,
    "rating": 0,
    "totalReviews": 0,
    "createdAt": "2026-01-22T10:30:00.000Z"
  }
}
```

---

### 2. **Login**

Authenticate user and get JWT token.

**Endpoint:** `POST /api/auth/login`  
**Access:** Public

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    /* user object */
  }
}
```

---

### 3. **Get Current User**

Get authenticated user's profile.

**Endpoint:** `GET /api/auth/me`  
**Access:** Private (requires JWT token)  
**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "success": true,
  "user": {
    /* user object */
  }
}
```

---

### 4. **Update Profile**

Update user profile information.

**Endpoint:** `PUT /api/auth/update`  
**Access:** Private  
**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "name": "John Updated",
  "phone": "08098765432",
  "location": "Main Campus",
  "bio": "Student at FUTMINNA selling quality items"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Profile updated successfully!",
  "user": {
    /* updated user object */
  }
}
```

---

### 5. **Change Password**

Change user password.

**Endpoint:** `PUT /api/auth/change-password`  
**Access:** Private  
**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewSecurePass456"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Password changed successfully!"
}
```

---

### 6. **Get User by ID**

Get public profile of any user.

**Endpoint:** `GET /api/auth/user/:id`  
**Access:** Public

**Response (200):**

```json
{
  "success": true,
  "user": {
    /* user object */
  }
}
```

---

## 📦 **Product Endpoints**

### 1. **Create Product**

Create a new product listing.

**Endpoint:** `POST /api/products`  
**Access:** Private  
**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "title": "iPhone 13 Pro Max 256GB",
  "description": "Excellent condition, battery health 95%",
  "price": 450000,
  "originalPrice": 520000,
  "condition": "Used",
  "category": "electronics",
  "location": "Bosso Campus",
  "images": [
    {
      "public_id": "cloudinary_public_id",
      "url": "https://cloudinary.com/image.jpg"
    }
  ]
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Product created successfully!",
  "product": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "iPhone 13 Pro Max 256GB",
    "description": "Excellent condition, battery health 95%",
    "price": 450000,
    "originalPrice": 520000,
    "condition": "Used",
    "category": "electronics",
    "images": [
      {
        /* image objects */
      }
    ],
    "location": "Bosso Campus",
    "seller": {
      "_id": "...",
      "name": "John Doe",
      "avatar": { "url": "" },
      "verified": false,
      "rating": 0
    },
    "views": 0,
    "likes": 0,
    "status": "available",
    "averageRating": 0,
    "totalReviews": 0,
    "createdAt": "2026-01-22T10:30:00.000Z",
    "updatedAt": "2026-01-22T10:30:00.000Z"
  }
}
```

---

### 2. **Get All Products (with filters)**

Get all available products with optional filters.

**Endpoint:** `GET /api/products`  
**Access:** Public

**Query Parameters:**

- `category` - Filter by category (electronics, fashion, books, etc.)
- `condition` - Filter by condition (New, Used, Fairly Used)
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `location` - Filter by location (partial match)
- `search` - Text search in title and description
- `sort` - Sort option (price-asc, price-desc, popular, rating)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Example:** `GET /api/products?category=electronics&minPrice=100000&maxPrice=500000&page=1&limit=20`

**Response (200):**

```json
{
  "success": true,
  "products": [
    {
      /* product object */
    },
    {
      /* product object */
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "pages": 3,
    "limit": 20
  }
}
```

---

### 3. **Get Product by ID**

Get detailed information about a specific product.

**Endpoint:** `GET /api/products/:id`  
**Access:** Public

**Response (200):**

```json
{
  "success": true,
  "product": {
    /* Full product object with seller details and reviews */
  }
}
```

---

### 4. **Update Product**

Update product information.

**Endpoint:** `PUT /api/products/:id`  
**Access:** Private (owner only)  
**Headers:** `Authorization: Bearer <token>`

**Request Body:** (Same as create, only include fields to update)

```json
{
  "price": 420000,
  "description": "Updated description"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Product updated successfully!",
  "product": {
    /* updated product */
  }
}
```

---

### 5. **Delete Product**

Soft delete a product (marks as deleted).

**Endpoint:** `DELETE /api/products/:id`  
**Access:** Private (owner only)  
**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "success": true,
  "message": "Product deleted successfully!"
}
```

---

### 6. **Get User's Products**

Get all products listed by a specific user.

**Endpoint:** `GET /api/products/user/:userId`  
**Access:** Public

**Query Parameters:**

- `status` - Filter by status (available, sold, reserved, deleted, all)

**Response (200):**

```json
{
  "success": true,
  "products": [
    /* array of products */
  ]
}
```

---

### 7. **Add Review**

Add a review/rating to a product.

**Endpoint:** `POST /api/products/:id/reviews`  
**Access:** Private  
**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "rating": 5,
  "comment": "Great product! Seller was very responsive."
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Review added successfully!",
  "product": {
    /* product with updated reviews */
  }
}
```

---

### 8. **Mark as Sold**

Mark a product as sold.

**Endpoint:** `PUT /api/products/:id/sold`  
**Access:** Private (owner only)  
**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "success": true,
  "message": "Product marked as sold!",
  "product": {
    /* updated product */
  }
}
```

---

## 📊 **Product Categories**

Available categories:

- `electronics` - Electronics & Gadgets
- `fashion` - Fashion & Accessories
- `books` - Books & Stationery
- `furniture` - Furniture & Home
- `sports` - Sports & Fitness
- `beauty` - Beauty & Personal Care
- `food` - Food & Groceries
- `services` - Services
- `vehicles` - Vehicles
- `real-estate` - Real Estate
- `other` - Other

---

## 🔐 **Authentication**

For protected routes, include JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token is returned on successful signup/login and expires in 7 days (default).

---

## ❌ **Error Responses**

All errors follow this format:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": ["Additional error details"] // Optional
}
```

**Common Status Codes:**

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🧪 **Testing with Thunder Client / Postman**

### Setup:

1. Create a new collection "MKET API"
2. Set base URL: `http://localhost:3000/api`
3. For protected routes, add Authorization header after login

### Test Flow:

1. **Signup** → Get token
2. **Login** → Get token
3. **Get Me** → Verify authentication
4. **Create Product** → Create a listing
5. **Get Products** → See all products
6. **Get Product by ID** → View details
7. **Update Product** → Modify listing
8. **Add Review** → Rate a product
9. **Mark as Sold** → Mark product sold
10. **Delete Product** → Remove listing

---

## 📝 **Notes**

- All timestamps are in ISO 8601 format
- Prices are in Naira (₦) as numbers (not strings)
- Images require Cloudinary integration (Phase 2)
- Real-time features (chat, notifications) will be added in Phase 3
- Password must be at least 8 characters
- Email must be unique and valid format
- Products can only be modified by their owners or admins

---

## 🚀 **Next Steps**

1. ✅ Test all endpoints with Thunder Client
2. Integrate Cloudinary for image uploads
3. Add wishlist endpoints
4. Add messaging/chat endpoints
5. Add notifications endpoints
6. Implement Socket.io for real-time features
7. Add rate limiting and security middleware
8. Deploy to production (Railway/Render/Vercel)
