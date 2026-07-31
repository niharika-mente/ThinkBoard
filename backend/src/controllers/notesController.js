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

        if (!title.trim()) {
            return res.status(400).json({ message: "Title is required" });
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
        if (!title.trim()) {
            return res.status(400).json({ message: "Title is required" });
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

/**
 * Reorder notes (drag and drop)
 */
export async function reorderNotes(req, res) {
    try {
        const { id } = req.params; // Dragged note ID
        const { targetId, groupId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid note id" });
        }
        if (targetId && !mongoose.Types.ObjectId.isValid(targetId)) {
            return res.status(400).json({ message: "Invalid target id" });
        }
        if (groupId && !mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ message: "Invalid group id" });
        }

        const draggedNote = await Note.findOne({ _id: id, userId: req.user._id });
        if (!draggedNote) {
            return res.status(404).json({ message: "Note not found" });
        }

        const targetParentId = groupId || null;

        // Fetch sibling notes in target container sorted by current position
        const siblingNotes = await Note.find({
            userId: req.user._id,
            parentId: targetParentId
        }).sort({ position: 1, createdAt: -1 });

        // Filter out the dragged note if it exists in the siblings list
        const filteredSiblings = siblingNotes.filter(
            (n) => n._id.toString() !== id
        );

        // Find position to insert
        if (targetId) {
            const targetIndex = filteredSiblings.findIndex(
                (n) => n._id.toString() === targetId
            );
            if (targetIndex !== -1) {
                filteredSiblings.splice(targetIndex, 0, draggedNote);
            } else {
                filteredSiblings.push(draggedNote);
            }
        } else {
            filteredSiblings.push(draggedNote);
        }

        // Prepare bulk write operations to update positions & parentId for all siblings
        const bulkOps = filteredSiblings.map((n, index) => ({
            updateOne: {
                filter: { _id: n._id },
                update: { $set: { position: index, parentId: targetParentId } }
            }
        }));

        if (bulkOps.length > 0) {
            await Note.bulkWrite(bulkOps);
        }

        res.status(200).json({ message: "Notes reordered successfully" });
    } catch (error) {
        console.error("Error in reorderNotes controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

/**
 * Combine notes into a stack/group
 */
export async function groupNotes(req, res) {
    try {
        const { sourceId, targetId, title } = req.body;

        if (!sourceId || !targetId || !title || !title.trim()) {
            return res.status(400).json({ message: "sourceId, targetId, and title are required" });
        }

        if (!mongoose.Types.ObjectId.isValid(sourceId) || !mongoose.Types.ObjectId.isValid(targetId)) {
            return res.status(400).json({ message: "Invalid note IDs" });
        }

        const sourceNote = await Note.findOne({ _id: sourceId, userId: req.user._id });
        const targetNote = await Note.findOne({ _id: targetId, userId: req.user._id });

        if (!sourceNote || !targetNote) {
            return res.status(404).json({ message: "Source or target note not found" });
        }

        // If target is already a group, add the source note to it
        if (targetNote.isGroup) {
            // Find max position among existing children in this group
            const existingChildren = await Note.find({
                userId: req.user._id,
                parentId: targetNote._id
            }).sort({ position: -1 });

            const newPosition = existingChildren.length > 0 ? (existingChildren[0].position + 1) : 0;

            sourceNote.parentId = targetNote._id;
            sourceNote.position = newPosition;
            await sourceNote.save();

            return res.status(200).json(targetNote);
        }

        // Create a new group note
        const groupNote = new Note({
            userId: req.user._id,
            title: title.trim(),
            content: "",
            isGroup: true,
            parentId: null,
            position: targetNote.position || 0
        });

        const savedGroup = await groupNote.save();

        // Update source and target notes to point to the new group note
        sourceNote.parentId = savedGroup._id;
        sourceNote.position = 0;

        targetNote.parentId = savedGroup._id;
        targetNote.position = 1;

        await Promise.all([sourceNote.save(), targetNote.save()]);

        res.status(201).json(savedGroup);
    } catch (error) {
        console.error("Error in groupNotes controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

