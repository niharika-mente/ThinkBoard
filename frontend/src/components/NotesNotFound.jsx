import { NotebookIcon } from "lucide-react";
import { Link } from "react-router-dom";

const NotesNotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6 max-w-md mx-auto text-center">
      {/* Icon Circle */}
      <div className="bg-blue-50 dark:bg-blue-950 rounded-full p-6">
        <NotebookIcon className="size-12 text-blue-500 dark:text-blue-400" />
      </div>
      
      {/* Title */}
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
        No notes yet
      </h3>
      
      {/* Description */}
      <p className="text-gray-500 dark:text-gray-400">
        Ready to organize your thoughts? Create your first note to get started on your journey.
      </p>
      
      {/* Button */}
      <Link
        to="/create"
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <NotebookIcon size={18} />
        Create Your First Note
      </Link>
    </div>
  );
};

export default NotesNotFound;