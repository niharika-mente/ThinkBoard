import mongoose from "mongoose";
import Note from "../models/Note.js";

// Maximum allowed lengths for a note's fields (must match the Note model).
const TITLE_MAX_LENGTH = 100;
const CONTENT_MAX_LENGTH = 10000;

export async function getAllNotes(req, res) {
    try {
        const notes = await Note.find({ userId: req.user._id }).sort({ createdAt: -1 });

        res.status(200).json(notes);
    } catch (error) {
        console.error("Error in getAllNotes controller:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
}

export async function getNoteById(req, res) {
    try {
        const { id } = req.params;

        if (process.env.MONGO_URI && !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid note id",
            });
        }

        const note = await Note.findOne({ _id: id, userId: req.user._id });

        if (!note) {
            return res.status(404).json({
                message: "Note not found",
            });
        }

        res.status(200).json(note);
    } catch (error) {
        console.error("Error in getNoteById controller:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
}

export async function createNote(req, res) {
    try {
        const { title, content } = req.body;

        if (typeof title !== "string" || typeof content !== "string") {
            return res.status(400).json({ message: "Title and content must be strings" });
        }

        if (!title.trim() || !content.trim()) {
            return res.status(400).json({ message: "Title and content are required" });
        }

        if (title.trim().length > TITLE_MAX_LENGTH) {
            return res.status(400).json({ message: `Title cannot exceed ${TITLE_MAX_LENGTH} characters` });
        }
        if (content.trim().length > CONTENT_MAX_LENGTH) {
            return res.status(400).json({ message: `Content cannot exceed ${CONTENT_MAX_LENGTH} characters` });
        }

        const note = new Note({
            userId: req.user._id,
            title: title.trim(),
            content: content.trim(),
        });

        const savedNote = await note.save();

        res.status(201).json(savedNote);
    } catch (error) {
        console.error("Error in createNote controller:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
}

export async function updateNote(req, res) {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        if (process.env.MONGO_URI && !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid note id",
            });
        }

        if (typeof title !== "string" || typeof content !== "string") {
            return res.status(400).json({ message: "Title and content must be strings" });
        }
        if (!title.trim() || !content.trim()) {
            return res.status(400).json({ message: "Title and content are required" });
        }

        if (title.trim().length > TITLE_MAX_LENGTH) {
            return res.status(400).json({ message: `Title cannot exceed ${TITLE_MAX_LENGTH} characters` });
        }
        if (content.trim().length > CONTENT_MAX_LENGTH) {
            return res.status(400).json({ message: `Content cannot exceed ${CONTENT_MAX_LENGTH} characters` });
        }

        const updatedNote = await Note.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            {
                title: title.trim(),
                content: content.trim(),
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedNote) {
            return res.status(404).json({
                message: "Note not found",
            });
        }

        res.status(200).json(updatedNote);
    } catch (error) {
        console.error("Error in updateNote controller:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
}

export async function deleteNote(req, res) {
    try {
        const { id } = req.params;

        if (process.env.MONGO_URI && !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid note id",
            });
        }

        const deletedNote = await Note.findOneAndDelete({ _id: id, userId: req.user._id });

        if (!deletedNote) {
            return res.status(404).json({
                message: "Note not found",
            });
        }

        res.status(200).json({
            message: "Note deleted successfully",
        });
    } catch (error) {
        console.error("Error in deleteNote controller:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
}
