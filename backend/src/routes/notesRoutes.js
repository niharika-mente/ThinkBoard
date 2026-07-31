import express from "express";
import { getAllNotes, getNoteById, createNote, updateNote, deleteNote, reorderNotes, groupNotes } from "../controllers/notesController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import rateLimiter from "../middleware/rateLimiter.js";

const router = express.Router();

// Protect all notes routes - only authenticated users can access notes endpoints
router.use(authenticateUser);

router.get("/", rateLimiter, getAllNotes);
router.post("/group", rateLimiter, groupNotes);
router.get("/:id", rateLimiter, getNoteById);
router.post("/", rateLimiter, createNote);
router.put("/:id", rateLimiter, updateNote);
router.delete("/:id", rateLimiter, deleteNote);
router.patch("/:id/reorder", rateLimiter, reorderNotes);

export default router; 