import rateLimit from "express-rate-limit";
import ratelimit from "../config/upstash.js";

const fallbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests please try after some time" },
});

const rateLimiter = async (req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    return next();
  }
  
  try {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress || req.ip;
    const identifier = req.user?._id || ip || "global-rate-limit";
    const { success } = await ratelimit.limit(identifier);
    if (!success) {
      return res.status(429).json({ message: "Too many requests please try after some time" });
    }
    return next();
  } catch (error) {
    console.error("Rate limiter error (failing open to fallback):", error);
    return fallbackLimiter(req, res, next);
  }
};

export default rateLimiter;