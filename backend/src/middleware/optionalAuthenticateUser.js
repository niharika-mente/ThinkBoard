// middleware/optionalAuthenticateUser.js
import jwt from "jsonwebtoken";

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

export default optionalAuthenticateUser;