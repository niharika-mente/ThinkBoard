import express from "express";
const authRouter = express.Router();
import { register,login,getCurrentUser, logout } from "../controllers/userAuth.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/authRateLimiter.js";


authRouter.post("/register",authLimiter, register);
authRouter.post("/login", authLimiter, login);
authRouter.get("/me", authenticateUser, getCurrentUser); 
authRouter.post("/logout",authLimiter, logout);


export default authRouter;
