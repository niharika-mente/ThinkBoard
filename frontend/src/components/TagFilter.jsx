import { useState, useEffect } from "react";
import api from "../lib/axios";
import TagBadge from "./TagBadge";
import { TagsIcon, XIcon } from "lucide-react";

const TagFilter = ({ selectedTag, onSelectTag }) => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await api.get("/notes/tags");
        setTags(res.data);
      } catch (error) {
        console.log("Error fetching tags:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, []);

  if (loading) return null;

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <TagsIcon size={16} className="text-gray-400 dark:text-gray-500" />
      
      {/* "All" button */}
      {selectedTag && (
        <button
          onClick={() => onSelectTag(null)}
          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <XIcon size={12} />
          Clear filter
        </button>
      )}

      {tags.map((tag) => (
        <TagBadge
          key={tag.name}
          tag={tag.name}
          active={selectedTag === tag.name}
          onClick={() => onSelectTag(selectedTag === tag.name ? null : tag.name)}
        />
      ))}
    </div>
  );
};

export default TagFilter;