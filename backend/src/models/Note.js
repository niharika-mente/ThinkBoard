import mongoose from "mongoose";
//1-create schema
//2-create model
//3-export model
const noteSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            maxlength: [100, "Title cannot exceed 100 characters"],
        },
        content: {
            type: String,
            required: [true, "Content is required"],
            trim: true,
            maxlength: [5000, "Content cannot exceed 5000 characters"],
        },
    },
    {
        timestamps: true,
    }
);

const Note = mongoose.model("Note", noteSchema);

export default Note;