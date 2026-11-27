
import {
  useEffect,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
  Star,
  Loader2,
  LogOut,
} from "lucide-react";

import {
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";

import { searchMovies } from "../services/tmdb";
import type { Movie } from "../data/movies";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Movie[]>([]);

  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();

  // NAVIGATION LINKS
  const navLinks = [
    "Home",
    "Movies",
    "TV Shows",
    "Free Movies",
    "My List",
  ];

  // ==========================================
  // DEBOUNCED LIVE MOVIE SEARCH
  // ==========================================

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (!searchOpen || trimmedQuery.length < 2) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      setShowSuggestions(false);
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        setLoadingSuggestions(true);

        const results = await searchMovies(trimmedQuery);

        if (!cancelled) {
          setSuggestions(results.slice(0, 6));
          setShowSuggestions(true);
          setSelectedIndex(-1);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Live search error:", error);
          setSuggestions([]);
          setShowSuggestions(true);
        }
      } finally {
        if (!cancelled) {
          setLoadingSuggestions(false);
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, searchOpen]);

  // ==========================================
  // NAVIGATION
  // ==========================================

  const handleNavigation = (link: string) => {
    setMenuOpen(false);

    if (link === "Home" || link === "Movies") {
      navigate("/");
    } else if (link === "My List") {
      navigate("/my-list");
    } else if (link === "TV Shows") {
      navigate("/?section=tv-shows");
    } else if (link === "Free Movies") {
      navigate("/free-movies");
    }
  };

  // ==========================================
  // ACTIVE NAVIGATION LINK
  // ==========================================

  const isActiveLink = (link: string) => {
    if (link === "Home" || link === "Movies") {
      return location.pathname === "/" && !location.search;
    }

    if (link === "My List") {
      return location.pathname === "/my-list";
    }

    if (link === "TV Shows") {
      return location.search.includes("section=tv-shows");
    }

    if (link === "Free Movies") {
      return (
        location.pathname === "/free-movies" ||
        location.pathname.startsWith("/watch/")
      );
    }

    return false;
  };

  // ==========================================
  // SELECT MOVIE SUGGESTION
  // ==========================================

  const handleSuggestionClick = (movie: Movie) => {
    navigate(`/movie/${movie.id}`);

    setSearchQuery("");
    setSuggestions([]);
    setSearchOpen(false);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  // ==========================================
  // SEARCH ALL MOVIES
  // ==========================================

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) return;

    navigate(`/search?query=${encodeURIComponent(trimmedQuery)}`);

    setSearchQuery("");
    setSuggestions([]);
    setSearchOpen(false);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  // ==========================================
  // KEYBOARD NAVIGATION
  // ==========================================

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (suggestions.length > 0) {
        setSelectedIndex((previous) =>
          previous < suggestions.length - 1
            ? previous + 1
            : 0
        );
      }
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      if (suggestions.length > 0) {
        setSelectedIndex((previous) =>
          previous > 0
            ? previous - 1
            : suggestions.length - 1
        );
      }
    }

    if (event.key === "Enter" && selectedIndex >= 0) {
      event.preventDefault();

      const selectedMovie = suggestions[selectedIndex];

      if (selectedMovie) {
        handleSuggestionClick(selectedMovie);
      }
    }

    if (event.key === "Escape") {
      setShowSuggestions(false);
      setSearchOpen(false);
    }
  };

  // ==========================================
  // TOGGLE SEARCH PANEL
  // ==========================================

  const openSearch = () => {
    setSearchOpen((previous) => !previous);
    setMenuOpen(false);
    setShowSuggestions(false);
    setSuggestions([]);
    setSearchQuery("");
    setSelectedIndex(-1);
    setProfileOpen(false);
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setMenuOpen(false);
    navigate("/");
  };

  // ==========================================
  // NAVBAR UI
  // ==========================================

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/90 backdrop-blur-xl border-b border-white/5">

      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">

        {/* CINEVERSE CV MONOGRAM LOGO */}

        <button
          type="button"
          onClick={() => navigate("/")}
          aria-label="CineVerse Home"
          className="flex items-center gap-3 group"
        >
          {/* CV MONOGRAM */}

          <div className="relative w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-800 shadow-lg shadow-red-600/20 group-hover:shadow-red-500/40 transition duration-300">

            <span className="absolute text-[29px] font-black italic text-white tracking-tighter -translate-x-1">
              C
            </span>

            <span className="absolute text-[26px] font-black italic text-white/80 tracking-tighter translate-x-2 translate-y-1">
              V
            </span>

            <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-white shadow-sm" />

          </div>

          {/* BRAND NAME */}

          <div className="flex flex-col items-start leading-none">

            <h1 className="text-xl sm:text-2xl font-black tracking-[0.12em] text-white group-hover:text-red-500 transition duration-300">
              CINE<span className="text-red-500">VERSE</span>
            </h1>

            <span className="text-[8px] sm:text-[9px] tracking-[0.25em] text-gray-400 mt-1.5 font-medium">
              YOUR UNIVERSE OF CINEMA
            </span>

          </div>
        </button>

        {/* DESKTOP NAVIGATION */}

        <div className="hidden md:flex items-center gap-8 text-sm">

          {navLinks.map((link) => (
            <button
              key={link}
              type="button"
              onClick={() => handleNavigation(link)}
              className={`transition duration-300 ${
                isActiveLink(link)
                  ? "text-red-500 font-semibold"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {link}
            </button>
          ))}

        </div>

        {/* RIGHT SIDE ICONS */}

        <div className="flex items-center gap-5 text-white">

          {/* SEARCH ICON */}

          <button
            type="button"
            onClick={openSearch}
            aria-label="Open movie search"
            className="hover:text-red-500 transition"
          >
            {searchOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>

          {/* NOTIFICATION */}

          <button
            type="button"
            aria-label="Notifications"
            className="hover:text-red-500 transition"
          >
            <Bell className="w-5 h-5" />
          </button>

          {/* AUTHENTICATION / PROFILE */}

          <div className="hidden sm:block relative">

            {!user ? (
              <div className="flex items-center gap-3">

                <Link
                  to="/login"
                  className="text-sm text-gray-300 hover:text-white transition"
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold transition"
                >
                  Sign Up
                </Link>

              </div>
            ) : (
              <div className="relative">

                <button
                  type="button"
                  onClick={() =>
                    setProfileOpen((previous) => !previous)
                  }
                  className="flex items-center gap-2 cursor-pointer"
                  aria-label="Open profile menu"
                  aria-expanded={profileOpen}
                >
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  <ChevronDown className="w-4 h-4 hidden md:block" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-14 w-64 bg-[#181818] border border-gray-700 rounded-xl shadow-2xl p-4">

                    <div className="border-b border-gray-700 pb-3 mb-3">

                      <p className="text-white font-semibold truncate">
                        {user.name}
                      </p>

                      <p className="text-gray-400 text-xs mt-1 truncate">
                        {user.email}
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 text-gray-300 hover:text-red-500 transition py-2 text-sm"
                    >
                      <LogOut size={17} />
                      Sign Out
                    </button>

                  </div>
                )}

              </div>
            )}

          </div>

          {/* MOBILE MENU BUTTON */}

          <button
            type="button"
            className="md:hidden"
            onClick={() => {
              setMenuOpen(!menuOpen);
              setSearchOpen(false);
              setShowSuggestions(false);
              setProfileOpen(false);
            }}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>

        </div>

      </div>

      {/* SEARCH PANEL */}

      {searchOpen && (
        <div className="px-6 pb-5 max-w-7xl mx-auto">

          <form
            onSubmit={handleSearch}
            className="flex max-w-xl mx-auto bg-[#1c1c1c] border border-gray-700 rounded-lg overflow-hidden"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (searchQuery.trim().length >= 2) {
                  setShowSuggestions(true);
                }
              }}
              placeholder="Search movies..."
              autoFocus
              autoComplete="off"
              role="combobox"
              aria-expanded={
                showSuggestions && suggestions.length > 0
              }
              aria-controls="movie-suggestions"
              aria-activedescendant={
                selectedIndex >= 0
                  ? `movie-suggestion-${suggestions[selectedIndex]?.id}`
                  : undefined
              }
              className="flex-1 min-w-0 bg-transparent px-4 py-3 text-white outline-none placeholder:text-gray-500"
            />

            <button
              type="submit"
              aria-label="Search all movies"
              className="bg-red-600 hover:bg-red-700 px-5 transition"
            >
              <Search size={20} />
            </button>

          </form>

          {/* LIVE SUGGESTIONS */}

          {showSuggestions && searchQuery.trim().length >= 2 && (
            <div
              id="movie-suggestions"
              role="listbox"
              className="max-w-xl mx-auto mt-2 bg-[#181818] border border-gray-800 rounded-lg overflow-hidden shadow-2xl"
            >

              {/* LOADING */}

              {loadingSuggestions && (
                <div className="flex items-center justify-center gap-2 py-5 text-gray-400">
                  <Loader2 size={18} className="animate-spin" />

                  <span className="text-sm">
                    Searching movies...
                  </span>
                </div>
              )}

              {/* RESULTS */}

              {!loadingSuggestions && suggestions.length > 0 && (
                <>
                  {suggestions.map((movie, index) => (
                    <button
                      key={movie.id}
                      id={`movie-suggestion-${movie.id}`}
                      type="button"
                      role="option"
                      aria-selected={selectedIndex === index}
                      onClick={() => handleSuggestionClick(movie)}
                      className={`w-full flex items-center gap-4 p-3 text-left transition ${
                        selectedIndex === index
                          ? "bg-red-600/20"
                          : "hover:bg-white/10"
                      }`}
                    >
                      <img
                        src={movie.poster}
                        alt=""
                        className="w-12 h-16 object-cover rounded"
                      />

                      <div className="flex-1 min-w-0">

                        <h3 className="text-white font-medium truncate">
                          {movie.title}
                        </h3>

                        <p className="text-gray-400 text-xs mt-1">
                          {movie.year} • {movie.genre}
                        </p>

                      </div>

                      <div className="flex items-center gap-1 text-yellow-400 text-sm">

                        <Star
                          size={14}
                          className="fill-yellow-400"
                        />

                        {movie.rating}

                      </div>

                    </button>
                  ))}

                  {/* SEE ALL RESULTS */}

                  <button
                    type="button"
                    onClick={() => {
                      const query = searchQuery.trim();

                      if (query) {
                        navigate(
                          `/search?query=${encodeURIComponent(query)}`
                        );

                        setSearchQuery("");
                        setSuggestions([]);
                        setSearchOpen(false);
                        setShowSuggestions(false);
                        setSelectedIndex(-1);
                      }
                    }}
                    className="w-full text-center py-3 text-sm text-red-400 hover:bg-white/10 transition border-t border-gray-800"
                  >
                    See all search results →
                  </button>

                </>
              )}

              {/* NO RESULTS */}

              {!loadingSuggestions && suggestions.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-5">
                  No movies found. Try another title.
                </p>
              )}

            </div>
          )}

        </div>
      )}

      {/* MOBILE NAVIGATION */}

      {menuOpen && (
        <div className="md:hidden flex flex-col gap-5 px-6 pb-6 text-gray-300">

          {navLinks.map((link) => (
            <button
              key={link}
              type="button"
              onClick={() => handleNavigation(link)}
              className={`text-left transition duration-300 ${
                isActiveLink(link)
                  ? "text-red-500 font-semibold"
                  : "hover:text-white"
              }`}
            >
              {link}
            </button>
          ))}

          {/* MOBILE AUTHENTICATION */}

          <div className="border-t border-gray-800 pt-4">

            {!user ? (
              <div className="flex flex-col gap-4">

                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="hover:text-white transition"
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="bg-red-600 hover:bg-red-700 text-white text-center py-2 rounded-lg font-semibold transition"
                >
                  Create Account
                </Link>

              </div>
            ) : (
              <div className="flex flex-col gap-3">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">

                    <p className="text-white font-semibold truncate">
                      {user.name}
                    </p>

                    <p className="text-gray-400 text-xs truncate">
                      {user.email}
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 transition py-2"
                >
                  <LogOut size={17} />
                  Sign Out
                </button>

              </div>
            )}

          </div>

        </div>
      )}

    </nav>
  );
}

export default Navbar;
