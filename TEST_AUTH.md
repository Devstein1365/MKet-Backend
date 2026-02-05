# Authentication Testing Guide

## 🚀 Server Status

✅ Server is running on http://localhost:3000
✅ Database connected successfully

## 📧 Important: Email Configuration Required

Before testing email features (verification, password reset), you need to set up Gmail App Password:

### Steps to Get Gmail App Password:

1. Go to Google Account: https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Enable **2-Step Verification** (if not already enabled)
4. Go back to Security and click **App Passwords**
5. Select app: **Mail** and device: **Other (Custom name)**
6. Enter name: "MKET Backend"
7. Click **Generate**
8. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Update .env file:

```env
EMAIL_USER=your-actual-gmail@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
```

---

## 🧪 Test Endpoints

### 1. Test Signup (Create New User)

**Endpoint:** `POST http://localhost:3000/api/auth/signup`

**Request Body:**

```json
{
  "name": "John Doe Smith",
  "email": "john.smith@st.futminna.edu.ng",
  "password": "Test@1234",
  "phone": "08012345678",
  "studentId": "2021/1/12345MT"
}
```

**Expected Response (Success):**

```json
{
  "success": true,
  "message": "Account created successfully! Please check your email to verify your account.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "fullName": "John Doe Smith",
    "email": "john.smith@st.futminna.edu.ng",
    "phone": "08012345678",
    "studentId": "2021/1/12345MT",
    "isVerified": false,
    "avatarUrl": null,
    "avatarColor": "#FF6B6B",
    "createdAt": "2025-02-05T12:00:00.000Z"
  }
}
```

**Validations:**

- ✅ Name must have at least 2 parts (first and last name)
- ✅ Email must end with @st.futminna.edu.ng
- ✅ Password must be 8+ characters with uppercase, lowercase, number, and symbol
- ✅ Phone must be exactly 11 digits
- ✅ StudentId must be unique

---

### 2. Test Login

**Endpoint:** `POST http://localhost:3000/api/auth/login`

**Request Body:**

```json
{
  "email": "john.smith@st.futminna.edu.ng",
  "password": "Test@1234"
}
```

**Expected Response (Success):**

```json
{
  "success": true,
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "fullName": "John Doe Smith",
    "email": "john.smith@st.futminna.edu.ng",
    "isVerified": false,
    "lastLogin": "2025-02-05T12:05:00.000Z"
  }
}
```

---

### 3. Test Get Current User (Protected Route)

**Endpoint:** `GET http://localhost:3000/api/auth/me`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Expected Response (Success):**

```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "fullName": "John Doe Smith",
    "email": "john.smith@st.futminna.edu.ng",
    "phone": "08012345678",
    "studentId": "2021/1/12345MT",
    "bio": null,
    "location": null,
    "avatarUrl": null,
    "avatarColor": "#FF6B6B",
    "isVerified": false,
    "createdAt": "2025-02-05T12:00:00.000Z"
  }
}
```

---

### 4. Test Email Verification

**Step 1:** After signup, check the console output for the verification link:

```
✅ Verification email sent to: john.smith@st.futminna.edu.ng
Verification link: http://localhost:5173/verify-email/abc123def456...
```

**Step 2:** Copy the token from the link and test the endpoint:

**Endpoint:** `GET http://localhost:3000/api/auth/verify-email/:token`

**Example:** `GET http://localhost:3000/api/auth/verify-email/abc123def456...`

**Expected Response (Success):**

```json
{
  "success": true,
  "message": "Email verified successfully! You can now access all features."
}
```

---

### 5. Test Forgot Password

**Endpoint:** `POST http://localhost:3000/api/auth/forgot-password`

**Request Body:**

```json
{
  "email": "john.smith@st.futminna.edu.ng"
}
```

**Expected Response (Success):**

```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

**Note:** The console will show the reset link (since we're in development mode)

---

### 6. Test Reset Password

**Endpoint:** `POST http://localhost:3000/api/auth/reset-password`

**Request Body:**

```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewPass@1234"
}
```

**Expected Response (Success):**

```json
{
  "success": true,
  "message": "Password has been reset successfully! You can now log in with your new password."
}
```

---

### 7. Test Update Profile (Protected Route)

**Endpoint:** `PUT http://localhost:3000/api/auth/update`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Request Body:**

```json
{
  "bio": "Computer Science student passionate about web development and AI.",
  "location": "MM Castle",
  "phone": "08087654321",
  "avatar": {
    "publicId": "mket_uploads/avatar_abc123",
    "url": "https://res.cloudinary.com/daxxf6eal/image/upload/v123456789/mket_uploads/avatar_abc123.jpg"
  }
}
```

**Expected Response (Success):**

```json
{
  "success": true,
  "message": "Profile updated successfully!",
  "user": {
    "id": "uuid-here",
    "fullName": "John Doe Smith",
    "bio": "Computer Science student passionate about web development and AI.",
    "location": "MM Castle",
    "phone": "08087654321",
    "avatarUrl": "https://res.cloudinary.com/...",
    "avatarPublicId": "mket_uploads/avatar_abc123"
  }
}
```

---

### 8. Test Change Password (Protected Route)

**Endpoint:** `PUT http://localhost:3000/api/auth/change-password`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Request Body:**

```json
{
  "currentPassword": "Test@1234",
  "newPassword": "NewSecure@5678"
}
```

**Expected Response (Success):**

```json
{
  "success": true,
  "message": "Password changed successfully!"
}
```

---

### 9. Test Get User By ID (Public Route)

**Endpoint:** `GET http://localhost:3000/api/auth/user/:userId`

**Example:** `GET http://localhost:3000/api/auth/user/550e8400-e29b-41d4-a716-446655440000`

**Expected Response (Success):**

```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "fullName": "John Doe Smith",
    "studentId": "2021/1/12345MT",
    "bio": "Computer Science student passionate about web development and AI.",
    "location": "MM Castle",
    "avatarUrl": "https://res.cloudinary.com/...",
    "avatarColor": "#FF6B6B",
    "totalListings": 5,
    "totalSold": 2,
    "averageRating": 4.5,
    "createdAt": "2025-02-05T12:00:00.000Z"
  }
}
```

---

## 🧪 Testing Tools

### Option 1: Using VS Code Thunder Client (Recommended)

1. Install Thunder Client extension
2. Create a new collection called "MKET Auth"
3. Add requests for each endpoint above
4. Save JWT token as environment variable for protected routes

### Option 2: Using Postman

1. Import the requests above
2. Set up environment with `baseUrl = http://localhost:3000`
3. Use {{token}} variable for Authorization header

### Option 3: Using Frontend

1. Make sure server is running on port 3000
2. Start frontend: `cd Frontend && npm run dev`
3. Go to http://localhost:5173/auth
4. Test signup and login flows

---

## 🐛 Common Errors

### 1. Email Already Exists

```json
{
  "success": false,
  "message": "Email already registered"
}
```

**Solution:** Use a different email

### 2. Invalid FUTMINNA Email

```json
{
  "success": false,
  "message": "Only FUTMINNA student emails (@st.futminna.edu.ng) are allowed"
}
```

**Solution:** Use email ending with @st.futminna.edu.ng

### 3. Weak Password

```json
{
  "success": false,
  "message": "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
}
```

**Solution:** Use a stronger password like `Test@1234`

### 4. Invalid Phone Number

```json
{
  "success": false,
  "message": "Phone number must be exactly 11 digits"
}
```

**Solution:** Use 11-digit Nigerian phone number like `08012345678`

### 5. Invalid JWT Token

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

**Solution:** Login again to get a new token

### 6. Token Expired

```json
{
  "success": false,
  "message": "Verification token has expired"
}
```

**Solution:** Use resend verification endpoint

---

## ✅ Next Steps After Testing

1. ✅ Test all auth endpoints listed above
2. Build product CRUD endpoints (create, get, update, delete products)
3. Setup Socket.io for real-time chat
4. Build wishlist functionality
5. Build reviews and ratings system
6. Build notifications system
7. Integrate with frontend Auth.jsx

---

## 📝 Notes for Development

- **JWT Token Expiry:** 7 days (configured in .env)
- **Verification Token Expiry:** 24 hours
- **Reset Token Expiry:** 1 hour
- **Password Hashing:** bcrypt with 10 salt rounds
- **Avatar Colors:** 10 predefined colors for default avatars (initials)
- **Database:** PostgreSQL with Prisma ORM
- **Email Service:** Nodemailer with Gmail SMTP

---

## 🔒 Security Features Implemented

✅ Password hashing with bcrypt
✅ JWT authentication with expiry
✅ Email verification before full access
✅ Password reset with time-limited tokens
✅ Input validation and sanitization
✅ FUTMINNA email domain validation
✅ Strong password requirements
✅ Protected routes with auth middleware
✅ Sensitive data excluded from responses (no password/tokens returned)
✅ CORS protection for frontend origin only
