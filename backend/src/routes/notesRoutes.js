import express from "express";
import { getAllNotes, getNoteById, createNote, updateNote, deleteNote, reorderNotes, groupNotes } from "../controllers/notesController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all notes routes - only authenticated users can access notes endpoints
router.use(authenticateUser);

router.get("/", getAllNotes);

router.post("/group", groupNotes);

router.get("/:id", getNoteById);

router.post("/", createNote);

router.put("/:id", updateNote);

router.delete("/:id", deleteNote);

router.patch("/:id/reorder", reorderNotes);

export default router; 