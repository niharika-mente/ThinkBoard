import { Link, useNavigate } from "react-router-dom";
import { PlusIcon, Sun, Moon, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useState, useRef, useEffect } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Get first letter from user name
  const getFirstLetter = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Get random but consistent color based on name
  const getAvatarColor = () => {
    const name = user?.name || user?.email || "User";
    const colors = [
      "from-blue-600 to-sky-400",
      "from-blue-500 to-cyan-500",
      "from-sky-500 to-blue-700",
      "from-cyan-400 to-blue-600",
      "from-blue-400 to-indigo-500",
      "from-sky-400 to-cyan-600",
      "from-blue-500 to-sky-300",
      "from-indigo-500 to-blue-500"
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);

    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always redirect - even if API fails
      navigate("/login", { replace: true });
    }
  };


  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            ThinkBoard
          </Link>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <>
                {/* New Note Button */}
                <Link
                  to="/create"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <PlusIcon size={16} />
                  <span>New Note</span>
                </Link>

                {/* User Avatar with Dropdown */}
                <div className="relative ml-1" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`
                      w-11 h-11 rounded-full
                      bg-gradient-to-r from-blue-600 to-sky-400
                      text-white font-bold text-lg flex items-center justify-center
                      shadow-lg hover:scale-105 hover:shadow-xl
                      transition-all duration-300 focus:outline-none
                      ${isDropdownOpen ? 'ring-2 ring-blue-500 scale-105' : ''}
                    `}
                  >
                    {getFirstLetter()}
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
                      {/* User Info Section */}
                      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-12 h-12 rounded-full bg-gradient-to-r ${getAvatarColor()} 
                            text-white font-bold text-xl flex items-center justify-center shadow-md
                          `}>
                            {getFirstLetter()}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 dark:text-white text-lg">
                              {user?.name || "User"}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-900/30 transition-colors">
                            <LogOut className="size-4" />
                          </div>
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>

                      {/* Footer */}
                      <div className="px-5 pb-4 pt-1">
                        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                          Signed in as {user?.email?.split('@')[0]}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;