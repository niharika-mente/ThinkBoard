import mongoose from "mongoose";
import Note from "../models/Note.js";

/**
 * Get all notes belonging to the authenticated user.
 * Supports optional search query and tag filtering.
 */
export async function getAllNotes(req, res) {
    try {
        const { search, tag } = req.query;
        const filter = { userId: req.user._id };

        // Search filter: match title or content (case-insensitive)
        if (search && typeof search === "string" && search.trim()) {
            const regex = new RegExp(search.trim(), "i");
            filter.$or = [
                { title: regex },
                { content: regex },
            ];
        }

        // Tag filter: match any of the provided tags (comma-separated)
        if (tag && typeof tag === "string" && tag.trim()) {
            const tags = tag.split(",").map((t) => t.trim()).filter(Boolean);
            if (tags.length > 0) {
                filter.tags = { $in: tags };
            }
        }

        const notes = await Note.find(filter).sort({ createdAt: -1 });

        res.status(200).json(notes);
    } catch (error) {
        console.error("Error in getAllNotes controller:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
}

/**
 * Get a specific note by ID, verifying that it belongs to the authenticated user.
 */
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

/**
 * Create a new note associated with the authenticated user's ID.
 * Supports an optional tags array.
 */
export async function createNote(req, res) {
    try {
        const { title, content, tags } = req.body;

        if (typeof title !== "string" || typeof content !== "string") {
            return res.status(400).json({ message: "Title and content must be strings" });
        }

        if (!title.trim()) {
            return res.status(400).json({ message: "Title is required" });
        }

        // Validate tags if provided
        let parsedTags = [];
        if (tags !== undefined) {
            if (!Array.isArray(tags)) {
                return res.status(400).json({ message: "Tags must be an array of strings" });
            }
            parsedTags = tags
                .map((t) => (typeof t === "string" ? t.trim().toLowerCase() : ""))
                .filter((t) => t.length > 0);
        }

        const note = new Note({
            userId: req.user._id,
            title: title.trim(),
            content: content.trim(),
            tags: parsedTags,
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

/**
 * Update a specific note after verifying ownership by the authenticated user.
 * Supports updating title, content, and tags.
 */
export async function updateNote(req, res) {
    try {
        const { id } = req.params;
        const { title, content, tags } = req.body;

        if (process.env.MONGO_URI && !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid note id",
            });
        }

        if (typeof title !== "string" || typeof content !== "string") {
            return res.status(400).json({ message: "Title and content must be strings" });
        }
        if (!title.trim()) {
            return res.status(400).json({ message: "Title is required" });
        }

        // Build update object
        const updateData = {
            title: title.trim(),
            content: content.trim(),
        };

        // Handle tags update if provided
        if (tags !== undefined) {
            if (!Array.isArray(tags)) {
                return res.status(400).json({ message: "Tags must be an array of strings" });
            }
            updateData.tags = tags
                .map((t) => (typeof t === "string" ? t.trim().toLowerCase() : ""))
                .filter((t) => t.length > 0);
        }

        const updatedNote = await Note.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            updateData,
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

/**
 * Delete a specific note after verifying ownership by the authenticated user.
 */
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

/**
 * Get all unique tags used by the authenticated user.
 */
export async function getUserTags(req, res) {
    try {
        const result = await Note.aggregate([
            { $match: { userId: req.user._id } },
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
        ]);

        const tags = result.map((t) => ({
            name: t._id,
            count: t.count,
        }));

        res.status(200).json(tags);
    } catch (error) {
        console.error("Error in getUserTags controller:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
}