import express from "express";
import { getAllNotes, getNoteById, createNote, updateNote, deleteNote, reorderNote, createGroup } from "../controllers/notesController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateUser);

router.get("/", getAllNotes);

router.get("/:id", getNoteById);

router.post("/", createNote);

router.post("/group", createGroup);

router.patch("/:id/reorder", reorderNote);

router.put("/:id", updateNote);

router.delete("/:id", deleteNote);

export default router; 