import mongoose from "mongoose";

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


// Pre-hook to enforce validation on update operations
noteSchema.pre("findOneAndUpdate", function () {
    const update = this.getUpdate();
    if (!update) return;

    const $set = update.$set ?? update;
    if (typeof $set.title === "string") $set.title = $set.title.trim();
    if (typeof $set.content === "string") $set.content = $set.content.trim();

    if (update.$set) update.$set = $set;

    this.setUpdate(update);
    this.setOptions({ runValidators: true, context: "query" });
});


const Note = mongoose.model("Note", noteSchema);

export default Note;