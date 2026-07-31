
import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
 
  if (process.env.NODE_ENV !== "production") {
    return next();
  }
  
  try {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress || req.ip;
    const identifier = req.user?._id || ip || "global-rate-limit";
    const { success, limit, remaining, reset } = await ratelimit.limit(identifier);
    if (!success) {
      return res.status(429).json({ message: "Too many requests please try after some time" });
    }
    next();
  } catch (error) {
    console.error("Rate limiter error (failing open):", error);
    next();
  }
};

export default rateLimiter;