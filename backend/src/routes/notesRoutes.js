import express from "express";
import { getAllNotes, getNoteById, createNote, updateNote, deleteNote } from "../controllers/notesController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import rateLimiter from "../middleware/rateLimiter.js";

const router = express.Router();

// Protect all notes routes - rate-limit and authenticate
router.use(rateLimiter);
router.use(authenticateUser);

router.get("/", getAllNotes);

router.get("/:id", getNoteById);

router.post("/", createNote);

router.put("/:id", updateNote);

router.delete("/:id", deleteNote);

export default router; 