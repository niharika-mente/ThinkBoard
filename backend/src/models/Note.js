import mongoose from "mongoose";

//1-create schema
//2-create model
//3-export model
const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
  },
  {timestamps: true}//this will automatically add createdAt and updatedAt fields
);

const Note = mongoose.model("Note", noteSchema);

export default Note;