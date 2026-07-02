import mongoose from "mongoose";
import Note from "../models/Note.js";

/**
 * Get all notes belonging to the authenticated user.
 */
export async function getAllNotes(req, res) {
    try {
        const notes = await Note.find({ userId: req.user._id }).sort({ position: 1, createdAt: -1 });

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
 */
export async function createNote(req, res) {
    try {
        const { title, content } = req.body;

        if (typeof title !== "string" || typeof content !== "string") {
            return res.status(400).json({ message: "Title and content must be strings" });
        }

        if (!title.trim() || !content.trim()) {
            return res.status(400).json({ message: "Title and content are required" });
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

/**
 * Update a specific note after verifying ownership by the authenticated user.
 */
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

// Reorder a note, optionally moving it into a different container (parentId).
// Body: { targetId?, parentId? }
//  - targetId: position the dragged note at the target's index among its siblings.
//  - parentId: destination container (null = top level). Defaults to the target's
//    container, or the note's current container when neither is provided.
export async function reorderNote(req, res) {
    try {
        const { id } = req.params;
        const { targetId } = req.body;
        const hasParentId = Object.prototype.hasOwnProperty.call(req.body, "parentId");
        const bodyParentId = hasParentId ? req.body.parentId : undefined;

        const validationEnabled = Boolean(process.env.MONGO_URI);
        const isInvalidId = (value) =>
            validationEnabled && !mongoose.Types.ObjectId.isValid(value);

        if (isInvalidId(id)) {
            return res.status(400).json({ message: "Invalid note id" });
        }
        if (targetId != null && isInvalidId(targetId)) {
            return res.status(400).json({ message: "Invalid target id" });
        }
        if (hasParentId && bodyParentId != null && isInvalidId(bodyParentId)) {
            return res.status(400).json({ message: "Invalid parent id" });
        }

        const note = await Note.findOne({ _id: id, userId: req.user._id });
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        // Resolve the destination container.
        let newParentId = note.parentId ?? null;
        let target = null;
        if (targetId != null) {
            target = await Note.findOne({ _id: targetId, userId: req.user._id });
            if (!target) {
                return res.status(404).json({ message: "Target note not found" });
            }
            newParentId = target.parentId ?? null;
        }
        if (hasParentId) {
            newParentId = bodyParentId ?? null;
        }

        if (newParentId && String(newParentId) === String(note._id)) {
            return res.status(400).json({ message: "A note cannot be its own parent" });
        }

        // Order the destination's siblings, then splice the dragged note into place.
        const siblings = await Note.find({
            userId: req.user._id,
            parentId: newParentId,
            _id: { $ne: note._id },
        }).sort({ position: 1, createdAt: -1 });

        let insertIndex = siblings.length;
        if (target) {
            const idx = siblings.findIndex((s) => String(s._id) === String(target._id));
            if (idx !== -1) insertIndex = idx;
        }

        const ordered = [...siblings];
        ordered.splice(insertIndex, 0, note);

        await Promise.all(
            ordered.map((n, index) => {
                const update = { position: index };
                if (String(n._id) === String(note._id)) {
                    update.parentId = newParentId;
                }
                return Note.updateOne(
                    { _id: n._id, userId: req.user._id },
                    { $set: update }
                );
            })
        );

        const notes = await Note.find({ userId: req.user._id }).sort({ position: 1, createdAt: -1 });
        res.status(200).json(notes);
    } catch (error) {
        console.error("Error in reorderNote controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Create a group note from two existing notes.
// Body: { sourceId, targetId, title }
export async function createGroup(req, res) {
    try {
        const { sourceId, targetId, title } = req.body;

        if (typeof title !== "string" || !title.trim()) {
            return res.status(400).json({ message: "Group title is required" });
        }

        const validationEnabled = Boolean(process.env.MONGO_URI);
        for (const noteId of [sourceId, targetId]) {
            if (validationEnabled && !mongoose.Types.ObjectId.isValid(noteId)) {
                return res.status(400).json({ message: "Invalid note id" });
            }
        }
        if (String(sourceId) === String(targetId)) {
            return res.status(400).json({ message: "Cannot group a note with itself" });
        }

        const source = await Note.findOne({ _id: sourceId, userId: req.user._id });
        const target = await Note.findOne({ _id: targetId, userId: req.user._id });
        if (!source || !target) {
            return res.status(404).json({ message: "Note not found" });
        }

        const group = await Note.create({
            userId: req.user._id,
            title: title.trim(),
            content: "",
            isGroup: true,
            parentId: null,
            position: target.position ?? 0,
        });

        await Note.updateOne(
            { _id: target._id, userId: req.user._id },
            { $set: { parentId: group._id, position: 0 } }
        );
        await Note.updateOne(
            { _id: source._id, userId: req.user._id },
            { $set: { parentId: group._id, position: 1 } }
        );

        const notes = await Note.find({ userId: req.user._id }).sort({ position: 1, createdAt: -1 });
        res.status(201).json(notes);
    } catch (error) {
        console.error("Error in createGroup controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
