import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import csurf from "csurf";
import { fileURLToPath } from "url";
import dns from "dns";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== ENVIRONMENT VALIDATION ====================
const requiredEnvVars = ["PORT", "MONGO_URI", "JWT_SECRET", "NODE_ENV"];

const validateEnv = () => {
  const missing = requiredEnvVars.filter((varName) => !process.env[varName]);
  if (missing.length > 0) {
    console.error("Missing required environment variables:");
    missing.forEach((varName) => console.error(`  - ${varName}`));
    process.exit(1);
  }
  console.log("All required environment variables are present");
};

validateEnv();

// ==================== REDIS CLIENT REFERENCE ====================
let redisClientInstance = null;

// ==================== MIDDLEWARE ====================

// CORS Configuration
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.ALLOWED_ORIGINS?.split(",") || []
      : ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(cookieParser());

// CSRF Protection Middleware
const csrfMiddleware = csurf({ cookie: { httpOnly: true, sameSite: "lax" }, ignoreMethods: ["GET", "HEAD", "OPTIONS"] });
const csrfProtection = (req, res, next) => {
  if (process.env.NODE_ENV !== "production" || req.headers.authorization?.startsWith("Bearer ")) {
    const origin = req.headers.origin || req.headers.referer;
    const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";
    if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method) && origin && !origin.startsWith(allowedOrigin)) {
      return res.status(403).json({ message: "CSRF check failed: unauthorized origin" });
    }
    return next();
  }
  return csrfMiddleware(req, res, next);
};
app.use(csrfProtection);

// Optional auth to populate req.user for rateLimiter
const optionalAuthenticateUser = (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

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
app.use("/api", rateLimiter);
app.use("/api", optionalAuthenticateUser);

// ==================== ROUTES ====================
app.use("/api/notes", notesRoutes);
app.use("/api/auth", authRoutes);

// ==================== IMPROVED HEALTH CHECK ====================
app.get("/health", async (req, res) => {
  let mongodbStatus = "Disconnected";
  let redisStatus = "Disconnected";

  try {
    const mongoose = await import("mongoose");
    mongodbStatus =
      mongoose.default.connection.readyState === 1
        ? "Connected"
        : "Disconnected";
  } catch (error) {
    mongodbStatus = "Error";
  }

  try {
    if (redisClientInstance && redisClientInstance.isReady) {
      redisStatus = "Connected";
    }
  } catch (error) {
    redisStatus = "Error";
  }

  const healthStatus = {
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      mongodb: mongodbStatus,
      redis: redisStatus,
    },
    environment: process.env.NODE_ENV || "development",
  };

  const isHealthy = mongodbStatus === "Connected";
  res.status(isHealthy ? 200 : 503).json(healthStatus);
});

// ==================== PRODUCTION STATIC FILES ====================
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend", "dist", "index.html"));
  });
}

// ==================== IMPROVED ERROR HANDLING ====================
class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }

  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ==================== GRACEFUL SHUTDOWN ====================
let server = null;

const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);

  const timeout = setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);

  try {
    const mongoose = await import("mongoose");
    if (mongoose.default.connection.readyState === 1) {
      await mongoose.default.connection.close();
      console.log("MongoDB connection closed");
    }

    if (redisClientInstance && redisClientInstance.isReady) {
      await redisClientInstance.quit();
      console.log("Redis connection closed");
    }

    if (server) {
      server.close(() => {
        console.log("Server closed successfully");
        clearTimeout(timeout);
        process.exit(0);
      });
    } else {
      clearTimeout(timeout);
      process.exit(0);
    }
  } catch (error) {
    console.error("Error during shutdown:", error.message);
    clearTimeout(timeout);
    process.exit(1);
  }
};

// ==================== START SERVER ====================
const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB connected successfully");

    try {
      const redis = await connectRedis();
      redisClientInstance = redis;
      console.log("Redis connected successfully");
    } catch (redisError) {
      console.warn("Redis connection failed, continuing without Redis");
    }

    server = app.listen(process.env.PORT, () => {
      console.log("Server listening at port number: " + process.env.PORT);
      console.log("Environment: " + (process.env.NODE_ENV || "development"));
      console.log(
        "Health check: http://localhost:" + process.env.PORT + "/health",
      );
    });

    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

    process.on("uncaughtException", (error) => {
      console.error("Uncaught Exception:", error);
      gracefulShutdown("uncaughtException");
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled Rejection:", reason);
      gracefulShutdown("unhandledRejection");
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
