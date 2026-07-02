import mongoose from "mongoose";

//1-create schema
//2-create model
//3-export model
const noteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, "Title cannot exceed 100 characters"]
    },
    content: {
        type: String,
        default: "",
        maxlength: [10000, "Content cannot exceed 10000 characters"]
    },
    isGroup: {
        type: Boolean,
        default: false
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Note",
        default: null
    },
    position: {
        type: Number,
        default: 0
    }
  },
  {timestamps: true}//this will automatically add createdAt and updatedAt fields
);

const Note = mongoose.model("Note", noteSchema);

export default Note;