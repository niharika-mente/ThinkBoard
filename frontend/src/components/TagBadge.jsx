import { XIcon } from "lucide-react";

const TAG_COLORS = [
  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
];

const getTagColor = (tag) => {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
};

const TagBadge = ({ tag, onRemove, onClick, active = false, size = "sm" }) => {
  const sizeClasses = size === "sm" 
    ? "text-xs px-2 py-0.5" 
    : "text-sm px-3 py-1";

  const activeClasses = active 
    ? "ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-gray-800" 
    : "";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses} ${getTagColor(tag)} ${activeClasses} ${onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
      onClick={onClick ? (e) => { e.stopPropagation(); onClick(tag); } : undefined}
    >
      #{tag}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag);
          }}
          className="ml-0.5 hover:opacity-70 transition-opacity"
        >
          <XIcon size={size === "sm" ? 10 : 12} />
        </button>
      )}
    </span>
  );
};

export default TagBadge;