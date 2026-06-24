import User from "../models/User.js";
import Validate from "../Utils/Validetor.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import redisClient from '../config/redis.js';

// ==================== REGISTER ====================
export const register = async (req, res) => {
  try {
    Validate(req.body);
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: 60 * 60 },
    );

    res.cookie("token", token, {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// ==================== LOGIN ====================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        success: false,
        error: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: 60 * 60 },
    );

    res.cookie("token", token, {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Logged in Successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(401).json({
      success: false,
      error: err.message,
    });
  }
};

// ==================== LOGOUT (Fast - Redis optional) ====================
export const logoutUser = async (req, res) => {
  // ✅ First: Clear cookie immediately (fast)
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  // ✅ Second: Try Redis blacklist in background (don't await, let it run async)
  const token = req.cookies?.token;
  if (token) {
    // Fire and forget - don't await, don't block response
    const blacklistToken = async () => {
      try {
        const decoded = jwt.decode(token);
        if (decoded && decoded.exp) {
          const ttl = decoded.exp - Math.floor(Date.now() / 1000);
          if (ttl > 0 && redisClient && typeof redisClient.setex === 'function') {
            await redisClient.setex(`blacklist:${token}`, ttl, "blocked");
            console.log("✅ Token blacklisted in Redis");
          }
        }
      } catch (error) {
        // Silent fail - don't log every error
        if (process.env.NODE_ENV === "development") {
          console.warn("⚠️ Redis blacklist skipped");
        }
      }
    };
    
    // Execute without blocking response
    blacklistToken();
  }

  // ✅ Send response immediately
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// ==================== GET CURRENT USER ====================
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ Get current user error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};