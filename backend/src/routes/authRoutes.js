import express from "express";
const authRouter = express.Router();
import { register,login,getCurrentUser, logout } from "../controllers/userAuth.js";
import { authenticateUser } from "../middleware/authMiddleware.js";


authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", authenticateUser, getCurrentUser); 
authRouter.post("/logout", logout);


export default authRouter;
