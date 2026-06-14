
import { PenSquareIcon, Trash2Icon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { formatDate } from "../lib/utils";
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
      toast.error("Failed to delete");
    }
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", note._id);
    e.dataTransfer.effectAllowed = "move";

    const dragPreview = e.currentTarget.cloneNode(true);
    dragPreview.style.position = "absolute";
    dragPreview.style.top = "-1000px";
    dragPreview.style.left = "-1000px";
    dragPreview.style.width = `${e.currentTarget.offsetWidth}px`;
    dragPreview.style.pointerEvents = "none";
    dragPreview.style.opacity = "0.55";
    dragPreview.style.transform = "scale(0.98)";
    dragPreview.style.filter = "saturate(0.9) blur(0.1px)";
    document.body.appendChild(dragPreview);
    e.dataTransfer.setDragImage(dragPreview, e.currentTarget.offsetWidth / 2, e.currentTarget.offsetHeight / 2);
    window.requestAnimationFrame(() => {
      dragPreview.remove();
    });

    setActiveDragId(note._id);
  };

  const getDragIndicatorFromPoint = (clientX, clientY, currentTarget) => {
    const rect = currentTarget.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      if (y < height * 0.25) return "before";
      if (y > height * 0.75) return "after";
      return "stack";
    }

    if (x < width * 0.25) return "before";
    if (x > width * 0.75) return "after";
    return "stack";
  };

  const handleDragEnd = () => {
    setActiveDragId(null);
    setDragIndicator(null);
    setChildDragIndicator(null);
  };

  const handleDragOver = (e) => {
    if (activeDragId === note._id) return; // Cannot drop on itself

    if (note.isGroup) {
      // Don't drag children into their current parent
      const childrenIds = allNotes
        .filter((n) => n.parentId === note._id)
        .map((n) => n._id);
      if (childrenIds.includes(activeDragId)) return;
    }

    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragIndicator(getDragIndicatorFromPoint(e.clientX, e.clientY, e.currentTarget));
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
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {formatDate(new Date(note.createdAt))}
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