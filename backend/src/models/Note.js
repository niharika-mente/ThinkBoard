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
        required: true
    },
    content: {
        type: String,
        default: ""
    },
    tags: {
        type: [String],
        default: [],
        index: true
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