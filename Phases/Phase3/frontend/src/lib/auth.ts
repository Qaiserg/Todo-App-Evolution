import { betterAuth } from "better-auth";
import { Pool } from "pg";

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set!");
  throw new Error("DATABASE_URL environment variable is required");
}

if (!process.env.BETTER_AUTH_SECRET) {
  console.error("❌ BETTER_AUTH_SECRET is not set!");
  throw new Error("BETTER_AUTH_SECRET environment variable is required");
}

console.log("✅ Initializing Better Auth with database connection...");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1, // Limit connections for serverless
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "https://todo-app-evolution-phase3.vercel.app",
  ],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});

console.log("✅ Better Auth initialized successfully");
