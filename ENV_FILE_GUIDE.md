# 📝 Environment Variables Guide (.env file)

## **What is a .env file?**

The `.env` file stores **sensitive configuration** that you don't want to commit to GitHub (like passwords, API keys). Think of it as your app's "settings file" that changes between development and production.

---

## **Your Current .env File Breakdown:**

### **🔧 Server Configuration**

```env
PORT=3000
NODE_ENV=development
```

**PORT=3000**

- This is the port your backend server runs on
- Your backend will be accessible at: `http://localhost:3000`
- ✅ **Current value is correct** - Keep it as 3000

**NODE_ENV=development**

- Tells the app if it's in development or production mode
- `development`: More logging, better error messages, hot-reloading
- `production`: Optimized for speed, minimal logging
- ✅ **Current value is correct** - Keep as "development" while building

---

### **🐘 PostgreSQL Database**

```env
DATABASE_URL="postgresql://postgres:1365@localhost:5432/mket_db"
```

**This is THE MOST IMPORTANT variable!** Let's break it down:

**Full Format:**

```
postgresql://[username]:[password]@[host]:[port]/[database_name]
```

**Your Current Setup:**

```
postgresql://postgres:1365@localhost:5432/mket_db
```

Breaking it down:

- `postgresql://` - The database type (PostgreSQL)
- `postgres` - Your PostgreSQL username (usually "postgres" by default)
- `1365` - **YOUR PostgreSQL PASSWORD** (you set this during installation)
- `localhost` - The server location (your computer)
- `5432` - PostgreSQL's default port
- `mket_db` - Your database name (the one you created in pgAdmin)

**⚠️ CRITICAL: Make sure your password is correct!**
If you're getting connection errors, double-check:

1. Open pgAdmin
2. Try connecting - it will ask for your password
3. If that password works, use it in your DATABASE_URL
4. If you forgot it, you'll need to reset PostgreSQL password

---

### **🔐 JWT (JSON Web Tokens) - Authentication**

```env
JWT_SECRET=c2d24a1046638c1f31f7c5895cc113dffa143e4854289cecb5447b501b30d67c0358eb3006ae301329ef548e930387c19cd23dc621b07e21f72e10cc8f968b22
JWT_EXPIRE=7d
```

**JWT_SECRET**

- A long random string used to "sign" authentication tokens
- Think of it like a secret key that locks/unlocks user sessions
- ✅ **Current value is good** - It's long and random (128 characters)
- ⚠️ NEVER share this! Anyone with this can fake user logins

**JWT_EXPIRE=7d**

- How long a user stays logged in
- `7d` = 7 days (user can stay logged in for a week)
- Other examples: `1h` (1 hour), `30m` (30 minutes), `90d` (90 days)
- ✅ **Current value is good** - 7 days is a good balance

**How JWT Works:**

1. User logs in → Server creates a token using JWT_SECRET
2. Token sent to frontend → Stored in localStorage/cookies
3. Every API request includes this token
4. Server verifies token using JWT_SECRET
5. After 7 days (JWT_EXPIRE), token expires → User must login again

---

### **☁️ Cloudinary - Image Storage**

```env
CLOUDINARY_CLOUD_NAME=daxxf6eal
CLOUDINARY_API_KEY=168329534633484
CLOUDINARY_API_SECRET=fPHl5rXOPYzBq2cOdVKsL76kyEI
```

**What is Cloudinary?**

- A cloud service for storing images (like product photos)
- Instead of storing images on your server, you upload to Cloudinary
- They handle: resizing, optimization, CDN delivery

**Your Credentials:**

- `CLOUDINARY_CLOUD_NAME`: Your account identifier
- `CLOUDINARY_API_KEY`: Like a username for API access
- `CLOUDINARY_API_SECRET`: Like a password for API access

**✅ Your values look correct!** (Format matches Cloudinary's pattern)

**How to verify:**

1. Go to: https://cloudinary.com/console
2. Login to your account
3. Dashboard shows: Cloud Name, API Key, API Secret
4. Compare with your .env file - should match exactly

---

### **🌐 Frontend URL - CORS Configuration**

```env
FRONTEND_URL=http://localhost:5173
```

**What is this for?**

- Your React frontend runs on port 5173 (Vite's default)
- CORS security prevents random websites from accessing your API
- This tells your backend: "Only allow requests from http://localhost:5173"

**Port Numbers:**

- Frontend (React + Vite): Port 5173
- Backend (Express): Port 3000

**✅ Current value is correct** - Vite uses 5173 by default

**When to change:**

- If you deploy to production: Change to your actual domain
- Example: `FRONTEND_URL=https://mket.com`

---

## **🛡️ Security Best Practices**

### **1. Never Commit .env to GitHub**

✅ Your `.gitignore` should include:

```
.env
.env.local
.env.*.local
```

### **2. Use .env.example for Team Sharing**

Create a template without real values:

```env
# .env.example (safe to commit)
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
JWT_SECRET="your-secret-here"
# ... etc
```

### **3. Different Values for Production**

When deploying:

- Use stronger JWT_SECRET (even more random)
- Change NODE_ENV to "production"
- Use real database host (not localhost)
- Use HTTPS URLs for FRONTEND_URL

---

## **✅ Your .env File Checklist**

Let's verify everything is correct:

- [ ] **DATABASE_URL** - Does your password match pgAdmin?
- [ ] **PORT** - Set to 3000 ✅
- [ ] **NODE_ENV** - Set to development ✅
- [ ] **JWT_SECRET** - Long random string ✅
- [ ] **JWT_EXPIRE** - Set to 7d ✅
- [ ] **CLOUDINARY credentials** - Match your Cloudinary dashboard
- [ ] **FRONTEND_URL** - Set to http://localhost:5173 ✅

---

## **🐛 Common Errors & Solutions**

### **Error: "Can't reach database server"**

**Problem:** Database connection failed
**Check:**

1. Is PostgreSQL running? (Open pgAdmin and try to connect)
2. Is your password correct in DATABASE_URL?
3. Did you create the `mket_db` database in pgAdmin?

### **Error: "JWT_SECRET is not defined"**

**Problem:** .env file not loading
**Check:**

1. Is the file named exactly `.env` (not `env.txt` or `.env.txt`)?
2. Is it in the Backend folder root (not in src/ or elsewhere)?
3. Is `dotenv.config()` called in server.js? ✅

### **Error: "CORS policy: No 'Access-Control-Allow-Origin'"**

**Problem:** Frontend can't connect to backend
**Check:**

1. Is FRONTEND_URL correct in .env?
2. Is your frontend actually running on port 5173?
3. Check the CORS middleware in server.js ✅

---

## **📋 Quick Reference**

| Variable              | Your Value                     | What It Does           |
| --------------------- | ------------------------------ | ---------------------- |
| PORT                  | 3000                           | Backend server port    |
| NODE_ENV              | development                    | Development mode       |
| DATABASE_URL          | postgresql://postgres:1365@... | PostgreSQL connection  |
| JWT_SECRET            | c2d24a1046... (long)           | Auth token signing key |
| JWT_EXPIRE            | 7d                             | Login session duration |
| CLOUDINARY_CLOUD_NAME | daxxf6eal                      | Image storage account  |
| CLOUDINARY_API_KEY    | 168329534633484                | Cloudinary API access  |
| CLOUDINARY_API_SECRET | fPHl5rXOPYzBq2cOdVKsL76kyEI    | Cloudinary password    |
| FRONTEND_URL          | http://localhost:5173          | React app URL          |

---

## **🚀 Next Steps**

Now that your .env is set up:

1. ✅ Database created (mket_db)
2. ✅ .env configured
3. ⏭️ Next: Run Prisma commands to create tables
4. ⏭️ Then: Start building auth system

Ready to proceed! 🎯
