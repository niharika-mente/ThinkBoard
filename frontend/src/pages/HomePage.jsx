import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import RateLimitedUI from "../components/RateLimitedUI";
import api from "../lib/axios";
import toast from "react-hot-toast";
import NoteCard from "../components/NoteCard";
import NoteCardSkeleton from "../components/NoteCardSkeleton";
import NotesNotFound from "../components/NotesNotFound";
import SearchBar from "../components/SearchBar";
import TagFilter from "../components/TagFilter";
import { useAuth } from "../context/AuthContext";

const HomePage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimer = useRef(null);

  // Drag & drop state
  const [activeDragId, setActiveDragId] = useState(null);

  // Group creation modal state
  const [showNamingModal, setShowNamingModal] = useState(false);
  const [modalSourceId, setModalSourceId] = useState(null);
  const [modalTargetId, setModalTargetId] = useState(null);
  const [groupTitle, setGroupTitle] = useState("");

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery]);

  // Top-level notes (not grouped under another note)
  const topLevelNotes = notes.filter((n) => !n.groupId);

  const fetchNotes = useCallback(async () => {
    try {
      const params = {};
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      if (selectedTag) {
        params.tag = selectedTag;
      }
      const res = await api.get("/notes", { params });
      setNotes(res.data);
      setIsRateLimited(false);
    } catch (error) {
      console.log("Error fetching notes", error.response);
      if (error.response?.status === 429) {
        setIsRateLimited(true);
      } else {
        toast.error("Failed to load notes");
      }
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedTag]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }
    if (user) {
      fetchNotes();
    }
  }, [user, authLoading, navigate, fetchNotes]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setLoading(true);
  };

  const handleSelectTag = (tag) => {
    setSelectedTag(tag);
    setLoading(true);
  };

  if (authLoading || !user) {
    return null;
  }

  // Move a note to a new position
  const handleMoveNote = async (draggedId, targetId) => {
    const oldNotes = [...notes];
    const dragged = notes.find((n) => n._id === draggedId);
    const target = notes.find((n) => n._id === targetId);
    if (!dragged || !target) return;

    const newNotes = notes.filter((n) => n._id !== draggedId);
    const targetIndex = newNotes.findIndex((n) => n._id === targetId);
    newNotes.splice(targetIndex, 0, dragged);
    setNotes(newNotes);

    try {
      await api.patch(`/notes/${draggedId}/reorder`, { targetId });
      toast.success("Note reordered");
    } catch (error) {
      console.error("Error saving note position:", error);
      toast.error("Failed to save reordered note");
      setNotes(oldNotes);
    }
  };

  // Combine two notes into a group
  const handleCombineNotes = (sourceId, targetId) => {
    setModalSourceId(sourceId);
    setModalTargetId(targetId);
    setShowNamingModal(true);
  };

  // Create a group from two notes
  const handleCreateGroup = async () => {
    if (!groupTitle.trim()) return;
    try {
      await api.post("/notes/group", {
        sourceId: modalSourceId,
        targetId: modalTargetId,
        title: groupTitle,
      });
      toast.success(`Group "${groupTitle}" created!`);
      setShowNamingModal(false);
      setGroupTitle("");
      setModalSourceId(null);
      setModalTargetId(null);
      fetchNotes();
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group");
    }
  };

  // Reorder notes within a group
  const handleReorderNotes = async (groupId, draggedId, targetId) => {
    const oldNotes = [...notes];
    const dragged = notes.find((n) => n._id === draggedId);
    if (!dragged) return;

    const newNotes = notes.filter((n) => n._id !== draggedId);
    const targetIndex = newNotes.findIndex((n) => n._id === targetId);
    newNotes.splice(targetIndex, 0, dragged);
    setNotes(newNotes);

    try {
      await api.patch(`/notes/${draggedId}/reorder`, { targetId, groupId });
    } catch (error) {
      console.error("Error reordering within group:", error);
      toast.error("Failed to reorder note");
      setNotes(oldNotes);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 mt-6">
        {/* Search & Filter Toolbar */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <SearchBar value={searchQuery} onChange={handleSearchChange} />
          </div>
          <TagFilter selectedTag={selectedTag} onSelectTag={handleSelectTag} />
        </div>

        {/* Active filter indicator */}
        {(debouncedSearch || selectedTag) && !loading && (
          <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Showing {notes.length} result{notes.length !== 1 ? "s" : ""}
            {debouncedSearch && (
              <span>
                {" "}for "<span className="font-medium text-gray-700 dark:text-gray-300">{debouncedSearch}</span>"
              </span>
            )}
            {selectedTag && (
              <span>
                {" "}with tag <span className="font-medium text-blue-600 dark:text-blue-400">#{selectedTag}</span>
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedTag(null);
                setLoading(true);
              }}
              className="ml-2 text-blue-600 dark:text-blue-400 hover:underline text-xs"
            >
              Clear all filters
            </button>
          </div>
        )}

        {isRateLimited && <RateLimitedUI onRetry={() => window.location.reload()} />}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <NoteCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && notes.length === 0 && !isRateLimited && (
          <NotesNotFound isFiltered={!!(debouncedSearch || selectedTag)} />
        )}

        {!loading && notes.length > 0 && !isRateLimited && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {topLevelNotes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                setNotes={setNotes}
                allNotes={notes}
                activeDragId={activeDragId}
                setActiveDragId={setActiveDragId}
                onMoveNote={handleMoveNote}
                onCombineNotes={handleCombineNotes}
                onReorderNotes={handleReorderNotes}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modern Premium Group Naming Modal */}
      {showNamingModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-base-100 border border-base-300 rounded-2xl p-6 w-full max-w-md shadow-2xl scale-100 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-3 text-base-content flex items-center gap-2">
              📁 Create Group Stack
            </h3>
            <p className="text-sm text-base-content/70 mb-5">
              Enter a title to stack these matching cards into a combined container:
            </p>
            <input
              type="text"
              className="input input-bordered w-full mb-6 focus:ring-2 focus:ring-[#7480ff] text-base-content font-medium border-base-300"
              placeholder="e.g. Work, Ideas, Math Notes..."
              value={groupTitle}
              onChange={(e) => setGroupTitle(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && groupTitle.trim()) {
                  handleCreateGroup();
                }
              }}
            />
            <div className="flex justify-end gap-3">
              <button
                className="btn btn-ghost text-base-content/80"
                onClick={() => {
                  setShowNamingModal(false);
                  setGroupTitle("");
                  setModalSourceId(null);
                  setModalTargetId(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary bg-[#7480ff] hover:bg-[#5b68ff] text-white border-none px-6"
                onClick={handleCreateGroup}
                disabled={!groupTitle.trim()}
              >
                Create Stack
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;