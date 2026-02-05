# 🎯 How to Create PostgreSQL Database on Windows

## **What You Need to Understand First:**

### **MongoDB vs PostgreSQL - The Main Difference:**

**MongoDB (What you had before):**

- Database creates automatically when you connect
- No need to manually create database
- Just give it a name in connection string

**PostgreSQL (What you have now):**

- You MUST create the database first before connecting
- It won't create automatically
- Think of it like creating a folder before saving files in it

---

## **📋 STEP-BY-STEP: Create Your Database**

### **Method 1: Using pgAdmin (EASIEST - Recommended for Beginners)**

#### **Step 1: Open pgAdmin**

1. Press `Windows Key`
2. Type `pgAdmin` or `pgAdmin 4`
3. Click to open
4. It will open in your browser (Yes, it looks like a website but it's running locally!)

#### **Step 2: Connect to PostgreSQL**

1. You'll see "Servers" on the left side
2. Click the arrow next to "PostgreSQL 17" (or whatever version you installed)
3. It will ask for a password
4. Enter the password you set when installing PostgreSQL
5. ⚠️ **Remember this password! You'll need it in your .env file**

#### **Step 3: Create the Database**

1. Right-click on "Databases" in the left panel
2. Click "Create" → "Database..."
3. In the "Database" field, type: `mket_db`
4. Click "Save"
5. ✅ Done! You now have a database called `mket_db`

#### **Step 4: Update Your .env File**

Open your `.env` file and make sure this line matches:

```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/mket_db"
```

Replace `YOUR_PASSWORD` with the password you entered in Step 2!

---

### **Method 2: Using Command Line (For Advanced Users)**

#### **Step 1: Open SQL Shell (psql)**

1. Press `Windows Key`
2. Type `SQL Shell` or `psql`
3. Click to open
4. Press Enter 4 times (to accept defaults: localhost, 5432, postgres, your-username)
5. Enter your PostgreSQL password

#### **Step 2: Create Database**

Type this command:

```sql
CREATE DATABASE mket_db;
```

Press Enter

To verify it was created, type:

```sql
\l
```

You should see `mket_db` in the list!

To exit, type:

```sql
\q
```

---

## **🔧 Now What is Prisma and Those Commands?**

### **What is Prisma?**

Think of Prisma as a **translator** between your JavaScript code and PostgreSQL:

**Without Prisma (Raw SQL - Hard way):**

```javascript
const result = await database.query("SELECT * FROM users WHERE email = $1", [
  email,
]);
```

**With Prisma (Easy way):**

```javascript
const user = await prisma.user.findUnique({
  where: { email: email },
});
```

See? Much cleaner and safer!

---

### **Understanding the Prisma Commands:**

#### **Command 1: `npx prisma generate`**

**What it does:**

- Reads your `prisma/schema.prisma` file
- Creates JavaScript code that lets you talk to the database
- Creates the `prisma.user`, `prisma.product` methods you'll use

**When to run it:**

- After creating/changing your schema.prisma file
- Before you can use Prisma in your code

**Think of it like:**
Installing a package - you do it once, and then you can use it!

---

#### **Command 2: `npx prisma migrate dev --name init`**

**What it does:**

- Takes your Prisma schema (User, Product, etc.)
- Creates the actual tables in your PostgreSQL database
- Keeps track of changes (like Git for your database)

**When to run it:**

- After running `npx prisma generate`
- When you change your database structure (add/remove fields)

**Think of it like:**
Running a blueprint - it builds the actual database tables from your design!

The `--name init` part is just giving this first migration a name (like "init" or "initial_setup")

---

## **✨ Complete Setup Process (What You Should Do Now):**

### **Step 1: Create Database (Choose one method above)**

✅ Use pgAdmin or SQL Shell to create `mket_db`

### **Step 2: Update .env file**

Make sure your password is correct:

```
DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@localhost:5432/mket_db"
```

### **Step 3: Run Prisma Commands (In VS Code Terminal)**

Open your VS Code terminal and run these commands **ONE AT A TIME**:

```bash
# Go to Backend folder (if not already there)
cd Backend

# Command 1: Generate Prisma Client
npx prisma generate

# Wait for it to finish (should say "Generated Prisma Client")

# Command 2: Create database tables
npx prisma migrate dev --name init

# This will create all your tables (users, products, reviews, etc.)
```

### **Step 4: Verify Everything Works**

Run this to open Prisma Studio (a visual database browser):

```bash
npx prisma studio
```

This opens a webpage where you can see your empty tables! It's like phpMyAdmin for PostgreSQL.

---

## **🆘 Troubleshooting**

### **Error: "Can't reach database server"**

**Solution:**

- Make sure PostgreSQL is running
- Check your password in .env file
- Try using pgAdmin to connect first (to verify your password works)

### **Error: "Database 'mket_db' does not exist"**

**Solution:**

- You need to create the database first using pgAdmin or SQL Shell (see above)

### **Error: "Environment variable not found: DATABASE_URL"**

**Solution:**

- Make sure you have a `.env` file in your Backend folder
- Make sure it has the DATABASE_URL line

### **Forgot Your PostgreSQL Password?**

**Solution:**

- You'll need to reset it
- Google "reset PostgreSQL password Windows"
- Or reinstall PostgreSQL (won't lose data)

---

## **📝 Quick Reference**

| What You Want to Do         | Command/Tool               |
| --------------------------- | -------------------------- |
| Create database             | pgAdmin (GUI) or SQL Shell |
| View database tables        | `npx prisma studio`        |
| Create tables from schema   | `npx prisma migrate dev`   |
| Update Prisma Client code   | `npx prisma generate`      |
| See all databases           | pgAdmin or `\l` in psql    |
| Check if PostgreSQL running | pgAdmin - try to connect   |

---

## **Next Steps After Database is Created:**

1. ✅ Database created in pgAdmin
2. ✅ .env updated with correct password
3. ✅ Run `npx prisma generate`
4. ✅ Run `npx prisma migrate dev --name init`
5. ✅ Run `npx prisma studio` to see your tables
6. 🎉 Start building your controllers!

---

**Still confused? Let me know which step you're stuck on and I'll explain it differently!** 🚀
