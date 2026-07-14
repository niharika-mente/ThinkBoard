import express from "express";
import { getAllNotes, getNoteById, createNote, updateNote, deleteNote, getUserTags } from "../controllers/notesController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all notes routes - only authenticated users can access notes endpoints
router.use(authenticateUser);

router.get("/", getAllNotes);

router.get("/tags", getUserTags);

router.get("/:id", getNoteById);

router.post("/", createNote);

router.put("/:id", updateNote);

router.delete("/:id", deleteNote);

export default router; 
