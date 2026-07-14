import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { ArrowLeftIcon, LoaderIcon, PlusIcon, Trash2Icon } from "lucide-react";
import TagBadge from "../components/TagBadge";

const NoteDetailPage = () => {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await api.get(`/notes/${id}`);
        setNote(res.data);
      } catch (error) {
        console.log("Error in fetching note", error);
        toast.error("Failed to fetch the note");
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      await api.delete(`/notes/${id}`);
      toast.success("Note deleted");
      navigate("/");
    } catch (error) {
      console.log("Error deleting the note:", error);
      toast.error("Failed to delete note");
    }
  };

  const handleSave = async () => {
    if (!note.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);

    try {
      await api.put(`/notes/${id}`, {
        title: note.title,
        content: note.content,
        tags: note.tags || [],
      });
      toast.success("Note updated successfully");
      navigate("/");
    } catch (error) {
      console.log("Error saving the note:", error);
      toast.error("Failed to update note");
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (!trimmed) return;
    if ((note.tags || []).includes(trimmed)) {
      toast.error("Tag already added");
      return;
    }
    if ((note.tags || []).length >= 10) {
      toast.error("Maximum 10 tags allowed");
      return;
    }
    setNote({ ...note, tags: [...(note.tags || []), trimmed] });
    setTagInput("");
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setNote({
      ...note,
      tags: (note.tags || []).filter((t) => t !== tagToRemove),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoaderIcon className="animate-spin size-8 text-blue-500" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Note not found</h2>
        <Link
          to="/"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-md"
        >
          Back to Notes
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Action Buttons */}
          <div className="flex items-center justify-between mb-6 gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeftIcon size={18} />
              Back to Notes
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
            >
              <Trash2Icon size={18} />
              Delete Note
            </button>
          </div>

          {/* Note Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              {/* Title Input */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Note title"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  value={note.title}
                  onChange={(e) => setNote({ ...note, title: e.target.value })}
                />
              </div>

              {/* Tags Section */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add a tag and press Enter..."
                    className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                    className="px-3 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    <PlusIcon size={18} />
                  </button>
                </div>
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag) => (
                      <TagBadge
                        key={tag}
                        tag={tag}
                        onRemove={handleRemoveTag}
                        size="md"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Content Textarea */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  placeholder="Write your note here..."
                  rows={10}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
                  value={note.content}
                  onChange={(e) => setNote({ ...note, content: e.target.value })}
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 shadow-sm hover:shadow-md"
                  disabled={saving}
                  onClick={handleSave}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteDetailPage;