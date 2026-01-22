# 🧪 Quick API Testing Guide

Use these ready-to-copy requests for Thunder Client or Postman.

---

## 1️⃣ **Signup - Create Account**

**Method:** POST  
**URL:** `http://localhost:3000/api/auth/signup`  
**Body (JSON):**

```json
{
  "name": "John Doe",
  "email": "john@futminna.edu.ng",
  "password": "SecurePass123",
  "phone": "08012345678",
  "location": "Bosso Campus"
}
```

**Expected:** Token + User object

---

## 2️⃣ **Login**

**Method:** POST  
**URL:** `http://localhost:3000/api/auth/login`  
**Body (JSON):**

```json
{
  "email": "john@futminna.edu.ng",
  "password": "SecurePass123"
}
```

**Expected:** Token + User object  
**📝 Copy the token for next requests!**

---

## 3️⃣ **Get My Profile**

**Method:** GET  
**URL:** `http://localhost:3000/api/auth/me`  
**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected:** User profile

---

## 4️⃣ **Create Product**

**Method:** POST  
**URL:** `http://localhost:3000/api/products`  
**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body (JSON):**

```json
{
  "title": "iPhone 13 Pro Max 256GB - Like New",
  "description": "Excellent condition iPhone 13 Pro Max. Battery health at 95%. Comes with original charger and box. No scratches on screen. Used for only 6 months.",
  "price": 450000,
  "originalPrice": 520000,
  "condition": "Used",
  "category": "electronics",
  "location": "Bosso Campus",
  "images": [
    {
      "public_id": "test_image_1",
      "url": "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800"
    }
  ]
}
```

**Expected:** Product created

---

## 5️⃣ **Get All Products**

**Method:** GET  
**URL:** `http://localhost:3000/api/products`

**Expected:** Array of products

---

## 6️⃣ **Get Products with Filters**

**Method:** GET  
**URL:** `http://localhost:3000/api/products?category=electronics&minPrice=100000&maxPrice=500000&page=1&limit=10`

**Expected:** Filtered products

---

## 7️⃣ **Search Products**

**Method:** GET  
**URL:** `http://localhost:3000/api/products?search=iphone`

**Expected:** Search results

---

## 8️⃣ **Get Product by ID**

**Method:** GET  
**URL:** `http://localhost:3000/api/products/PRODUCT_ID_HERE`

**Expected:** Product details (views will increment)

---

## 9️⃣ **Update Product**

**Method:** PUT  
**URL:** `http://localhost:3000/api/products/PRODUCT_ID_HERE`  
**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body (JSON):**

```json
{
  "price": 420000,
  "description": "Updated: Price reduced! Excellent condition iPhone."
}
```

**Expected:** Updated product

---

## 🔟 **Add Review**

**Method:** POST  
**URL:** `http://localhost:3000/api/products/PRODUCT_ID_HERE/reviews`  
**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body (JSON):**

```json
{
  "rating": 5,
  "comment": "Great product! Seller was very responsive and honest about the condition."
}
```

**Expected:** Product with review added

---

## 1️⃣1️⃣ **Mark as Sold**

**Method:** PUT  
**URL:** `http://localhost:3000/api/products/PRODUCT_ID_HERE/sold`  
**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected:** Product marked as sold

---

## 1️⃣2️⃣ **Update Profile**

**Method:** PUT  
**URL:** `http://localhost:3000/api/auth/update`  
**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body (JSON):**

```json
{
  "name": "John Updated",
  "phone": "08098765432",
  "location": "Main Campus",
  "bio": "FUTMINNA student selling quality electronics and gadgets. Fast delivery within campus!"
}
```

**Expected:** Updated profile

---

## 1️⃣3️⃣ **Change Password**

**Method:** PUT  
**URL:** `http://localhost:3000/api/auth/change-password`  
**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body (JSON):**

```json
{
  "currentPassword": "SecurePass123",
  "newPassword": "NewSecurePass456"
}
```

**Expected:** Success message

---

## 1️⃣4️⃣ **Delete Product**

**Method:** DELETE  
**URL:** `http://localhost:3000/api/products/PRODUCT_ID_HERE`  
**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected:** Success message (soft delete)

---

## 1️⃣5️⃣ **Get User's Products**

**Method:** GET  
**URL:** `http://localhost:3000/api/products/user/USER_ID_HERE`

**Expected:** User's product listings

---

## 🎯 **Test Flow Recommendation**

1. **Signup** → Save token
2. **Login** → Verify login works
3. **Get Me** → Test authentication
4. **Create Product** → Test product creation
5. **Get All Products** → See your product
6. **Get Product by ID** → View details
7. **Update Product** → Modify your listing
8. **Search Products** → Test search
9. **Filter Products** → Test filters
10. **Add Review** → Rate a product (create another user first!)
11. **Update Profile** → Change user info
12. **Mark as Sold** → Change product status
13. **Delete Product** → Remove listing

---

## 📝 **Tips**

- **Save tokens:** After signup/login, save the token for use in other requests
- **Copy IDs:** After creating a product, copy the `_id` for other operations
- **Multiple users:** Create 2-3 test accounts to test reviews and interactions
- **Test errors:** Try wrong passwords, missing fields, invalid IDs to see error handling
- **Check database:** Use MongoDB Compass to view the actual data

---

## 🔍 **Common Issues**

**401 Unauthorized:**

- Token missing or invalid
- Token expired
- Check Authorization header format: `Bearer TOKEN`

**404 Not Found:**

- Wrong product/user ID
- Check URL spelling
- Product might be deleted

**400 Bad Request:**

- Missing required fields
- Invalid data format
- Check JSON syntax

**403 Forbidden:**

- Trying to update/delete someone else's product
- Not the product owner

---

## ✅ **Success Indicators**

- ✅ Signup returns token
- ✅ Login returns same user with token
- ✅ Products are created and retrievable
- ✅ Filters work correctly
- ✅ Authentication blocks unauthorized access
- ✅ Only owners can update their products
- ✅ Reviews are added and ratings calculated
- ✅ View count increments on each visit

**All working? Backend is ready! Time to connect the frontend! 🚀**
