import express from "express";
import { getAllNotes, getNoteById, createNote, updateNote, deleteNote } from "../controllers/notesController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import rateLimiter from "../middleware/rateLimiter.js";

const router = express.Router();

// Protect all notes routes - only authenticated users can access notes endpoints
router.use(authenticateUser);

router.get("/", rateLimiter, getAllNotes);
router.get("/:id", rateLimiter, getNoteById);
router.post("/", rateLimiter, createNote);
router.put("/:id", rateLimiter, updateNote);
router.delete("/:id", rateLimiter, deleteNote);

export default router; 