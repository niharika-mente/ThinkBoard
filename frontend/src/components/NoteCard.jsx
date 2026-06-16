
import { PenSquareIcon, Trash2Icon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { formatDateTime } from "../lib/utils";
import api from "../lib/axios";
import toast from "react-hot-toast";

const NoteCard = ({ note, setNotes }) => {
  const navigate = useNavigate();

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      await api.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((note) => note._id !== id));
      toast.success("Note deleted successfully");
    } catch (error) {
      console.log("Error in handleDelete", error);
      toast.error("Failed to delete note");
    }
  };

  const handleEdit = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/note/${id}`); 
  };

  return (
    <div className="group relative">
      <Link
        to={`/note/${note._id}`}
        className="block bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800"
      >
        {/* Gradient Top Bar */}
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        <div className="p-5">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {note.title || "Untitled"}
          </h3>
          
          {/* Content Preview */}
          <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 mb-4 leading-relaxed">
            {note.content || "No content"}
          </p>
          
          {/* Footer */}
          <div className="flex items-center justify-between mt-2">
            {/* Date */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Created: {formatDateTime(new Date(note.createdAt))}
              </span>

              <span className="text-xs text-gray-400 dark:text-gray-500">
                Updated: {formatDateTime(new Date(note.updatedAt))}
              </span>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {/* Edit Button */}
              <button
                className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950"
                onClick={(e) => handleEdit(e, note._id)}
                aria-label="Edit note"
                title="Edit"
              >
                <PenSquareIcon size={16} />
              </button>
              
              {/* Delete Button */}
              <button
                className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950"
                onClick={(e) => handleDelete(e, note._id)}
                aria-label="Delete note"
                title="Delete"
              >
                <Trash2Icon size={16} />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default NoteCard;