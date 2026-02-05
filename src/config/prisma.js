// ===================================
// PRISMA DATABASE CLIENT
// ===================================
// This file creates and exports a Prisma Client instance that connects
// to your PostgreSQL database using the DATABASE_URL from your .env file.
//
// What is Prisma Client?
// - It's an auto-generated query builder that lets you interact with your database
// - Instead of writing raw SQL, you write JavaScript: prisma.user.findMany()
// - It provides type-safety and auto-completion in VS Code
//
// Why Singleton Pattern?
// - In development, hot-reloading can create multiple Prisma instances
// - This pattern ensures we only have ONE instance across the entire app
// - Prevents "too many database connections" errors
// ===================================

import { PrismaClient } from "@prisma/client";

// ===================================
// CREATE PRISMA CLIENT (SINGLETON)
// ===================================
// Store Prisma instance globally to survive hot-reloads in development
const globalForPrisma = global;

// Create Prisma Client with logging configuration
export const prisma =
  globalForPrisma.prisma || // Use existing instance if available
  new PrismaClient({
    // Logging Configuration:
    // In development: Log all queries, errors, and warnings (helpful for debugging)
    // In production: Only log errors (keeps logs clean and performant)
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// In non-production environments, save the instance globally
// This prevents creating multiple instances during hot-reloads
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// ===================================
// DATABASE CONNECTION VERIFICATION
// ===================================
// This function tests if we can connect to the PostgreSQL database
// Similar to how we used to do `mongoose.connect()` in MongoDB
export const connectDatabase = async () => {
  try {
    // $connect() explicitly connects to the database
    await prisma.$connect();

    // Try a simple query to verify connection works
    await prisma.$queryRaw`SELECT 1`;

    console.log("✅ PostgreSQL Database Connected Successfully");
    console.log(
      `📊 Database: ${process.env.DATABASE_URL?.split("@")[1] || "mket_db"}`,
    );

    return true;
  } catch (error) {
    console.error("❌ Database Connection Failed:");
    console.error("Error:", error.message);

    // Helpful error messages for common issues
    if (error.message.includes("Can't reach database server")) {
      console.error(
        "\n💡 Tip: Make sure PostgreSQL is running on your computer",
      );
      console.error(
        "   - Open pgAdmin to check if PostgreSQL service is active",
      );
    } else if (error.message.includes("authentication failed")) {
      console.error(
        "\n💡 Tip: Check your DATABASE_URL password in the .env file",
      );
    } else if (
      error.message.includes("database") &&
      error.message.includes("does not exist")
    ) {
      console.error("\n💡 Tip: Create the database using pgAdmin first");
      console.error(
        "   - Right-click 'Databases' → Create → Database → Name: mket_db",
      );
    }

    // Don't exit the process in development (so we can fix and restart)
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }

    return false;
  }
};

// ===================================
// GRACEFUL SHUTDOWN
// ===================================
// When the server stops, properly close the database connection
// This prevents hanging connections and ensures clean shutdown
process.on("beforeExit", async () => {
  console.log("\n🔌 Disconnecting from database...");
  await prisma.$disconnect();
  console.log("✅ Database disconnected cleanly");
});

// Also handle manual interrupts (Ctrl+C)
process.on("SIGINT", async () => {
  console.log("\n\n⚠️  Received shutdown signal...");
  await prisma.$disconnect();
  console.log("✅ Database disconnected");
  process.exit(0);
});

// ===================================
// EXPORTS
// ===================================
export default prisma;
