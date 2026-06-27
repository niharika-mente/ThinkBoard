import User from "../models/User.js";
import Validate from "../Utils/Validetor.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ==================== REGISTER ====================
export const register = async (req, res) => {
  try {
    Validate(req.body);
    const { name, email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error:
          "This email is already registered. Please sign in or use a different email address.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
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
    console.log("FULL ERROR:", err);

    // Handle duplicate email (race condition / unique index violation)
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        error:
          "This email is already registered. Please sign in or use a different email address.",
      });
    }

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
      return res.status(400).json({
        success: false,
        error: "Please enter both email and password.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        error:
          "This email address is not registered. Please create an account first.",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password. Please try again.",
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
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      error: "Server error. Please try again later.",
    });
  }
};

// // ==================== GET CURRENT USER ====================
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
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
    console.error("Get current user error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ==================== LOGOUT ====================
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      path: "/",
    });
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, error: "Server error during logout" });
  }
};

