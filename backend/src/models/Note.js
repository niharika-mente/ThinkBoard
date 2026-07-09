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
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

noteSchema.virtual("groupId").get(function () {
    return this.parentId;
});

const Note = mongoose.model("Note", noteSchema);

export default Note;