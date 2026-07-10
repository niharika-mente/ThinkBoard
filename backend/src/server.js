import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import dns from "dns";
import jwt from "jsonwebtoken";

// Routes
import notesRoutes from "./routes/notesRoutes.js";
import authRoutes from "./routes/authRoutes.js";

// Database & Redis
import { connectDB } from "./config/db.js";
import { connectRedis } from "./config/redis.js";

// Middleware
import rateLimiter from "./middleware/rateLimiter.js";

// ==================== CONFIGURATION ====================
dotenv.config();

// DNS configuration for better connectivity
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
// const PORT = process.env.PORT || 5001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== MIDDLEWARE ====================

// CORS Configuration
if (process.env.NODE_ENV !== "production") {
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true, // Allow cookies to be sent
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
}

// Body parsing middleware
app.use(express.json());
app.use(cookieParser());

// Optional auth to populate req.user for rateLimiter
const optionalAuthenticateUser = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
  } catch (error) {
    // Ignore verification errors (expired, invalid) for optional auth
  }
  next();
};

// Rate limiting and optional auth applied only to API routes
app.use("/api", optionalAuthenticateUser);
app.use("/api", rateLimiter);

// ==================== ROUTES ====================
app.use("/api/notes", notesRoutes);
app.use("/api/auth", authRoutes);

// ==================== HEALTH CHECK ====================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// ==================== PRODUCTION STATIC FILES ====================
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend", "dist", "index.html"));
  });
}

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ==================== START SERVER ====================
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log("MongoDB connected successfully");

    // Connect to Redis
    try {
      await connectRedis();
      console.log(" Redis connected successfully");
    } catch (redisError) {
      console.warn(" Redis connection failed, continuing without Redis");
    }

    // Start Express server
    app.listen(process.env.PORT, () => {
      console.log("Server listening at port number: " + process.env.PORT);
    });
  } catch (error) {
    console.error(" Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
