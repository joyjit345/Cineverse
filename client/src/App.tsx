
import { useEffect, useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

// Components
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import MovieCarousel from "./components/MovieCarousel";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import MovieDetails from "./pages/MovieDetails";
import SearchResults from "./pages/SearchResults";
import MyList from "./pages/MyList";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PublicMovies from "./pages/PublicMovies";
import WatchMovie from "./pages/WatchMovie";

// Authentication
import {
  AuthProvider,
  useAuth,
} from "./context/AuthContext";

// TMDB Services
import {
  getPopularMovies,
  getTrendingMovies,
  getActionMovies,
  getSciFiMovies,
  getDramaMovies,
} from "./services/tmdb";

// Types
import type { Movie } from "./data/movies";

// API URL
const API_URL = "http://localhost:5000/api";

// ==========================================
// HOME PAGE
// ==========================================

interface HomePageProps {
  watchlist: Movie[];
  toggleWatchlist: (movie: Movie) => void;
}

function HomePage({
  watchlist,
  toggleWatchlist,
}: HomePageProps) {
  const navigate = useNavigate();

  // Movie collections
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [actionMovies, setActionMovies] = useState<Movie[]>([]);
  const [sciFiMovies, setSciFiMovies] = useState<Movie[]>([]);
  const [dramaMovies, setDramaMovies] = useState<Movie[]>([]);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all movie collections
  useEffect(() => {
    async function loadMovies() {
      try {
        setLoading(true);
        setError(null);

        const [
          trending,
          popular,
          action,
          sciFi,
          drama,
        ] = await Promise.all([
          getTrendingMovies(),
          getPopularMovies(),
          getActionMovies(),
          getSciFiMovies(),
          getDramaMovies(),
        ]);

        setTrendingMovies(trending);
        setPopularMovies(popular);
        setActionMovies(action);
        setSciFiMovies(sciFi);
        setDramaMovies(drama);
      } catch (err) {
        console.error("Movie fetching error:", err);

        setError(
          "Unable to load movie collections. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadMovies();
  }, []);

  // Watchlist movie IDs
  const watchlistIds = watchlist.map(
    (movie) => movie.id
  );

  // Open movie details page
  const handleSelectMovie = (movie: Movie) => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div className="min-h-screen bg-[#080808]">
      <main>
        <Hero />

        <div className="px-6 pb-16 md:px-10 lg:px-16">

          {/* Loading */}
          {loading && (
            <div className="py-20 text-center">
              <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />

              <p className="text-gray-400">
                Loading amazing movies...
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="py-20 text-center">
              <p className="mb-4 text-lg text-red-500">
                {error}
              </p>

              <button
                onClick={() => window.location.reload()}
                className="rounded-md bg-red-600 px-6 py-2 text-white transition hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Movie Collections */}
          {!loading && !error && (
            <>
              <MovieCarousel
                title="Trending This Week"
                movies={trendingMovies}
                watchlistIds={watchlistIds}
                onToggleWatchlist={toggleWatchlist}
                onSelectMovie={handleSelectMovie}
              />

              <MovieCarousel
                title="Popular Movies"
                movies={popularMovies}
                watchlistIds={watchlistIds}
                onToggleWatchlist={toggleWatchlist}
                onSelectMovie={handleSelectMovie}
              />

              <MovieCarousel
                title="Action Movies"
                movies={actionMovies}
                watchlistIds={watchlistIds}
                onToggleWatchlist={toggleWatchlist}
                onSelectMovie={handleSelectMovie}
              />

              <MovieCarousel
                title="Sci-Fi Movies"
                movies={sciFiMovies}
                watchlistIds={watchlistIds}
                onToggleWatchlist={toggleWatchlist}
                onSelectMovie={handleSelectMovie}
              />

              <MovieCarousel
                title="Drama Movies"
                movies={dramaMovies}
                watchlistIds={watchlistIds}
                onToggleWatchlist={toggleWatchlist}
                onSelectMovie={handleSelectMovie}
              />
            </>
          )}

        </div>
      </main>
    </div>
  );
}

// ==========================================
// APP CONTENT - MONGODB WATCHLIST
// ==========================================

function AppContent() {
  const navigate = useNavigate();

  // Authentication
  const {
    user,
    token,
    loading: authLoading,
  } = useAuth();

  // Watchlist state
  const [watchlist, setWatchlist] = useState<Movie[]>([]);

  // Watchlist loading state
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  // ========================================
  // FETCH USER WATCHLIST FROM MONGODB
  // ========================================

  useEffect(() => {
    let cancelled = false;

    async function loadWatchlist() {
      // Wait until authentication is initialized
      if (authLoading) {
        return;
      }

      // Clear watchlist when user is logged out
      if (!user || !token) {
        setWatchlist([]);
        setWatchlistLoading(false);
        return;
      }

      try {
        setWatchlistLoading(true);

        const response = await fetch(
          `${API_URL}/watchlist`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch watchlist.");
        }

        const data = await response.json();

        if (!cancelled) {
          setWatchlist(data.movies || []);
        }
      } catch (error) {
        console.error("Watchlist fetching error:", error);

        if (!cancelled) {
          setWatchlist([]);
        }
      } finally {
        if (!cancelled) {
          setWatchlistLoading(false);
        }
      }
    }

    loadWatchlist();

    return () => {
      cancelled = true;
    };
  }, [user, token, authLoading]);

  // ========================================
  // ADD OR REMOVE MOVIES FROM MONGODB
  // ========================================

  const toggleWatchlist = async (movie: Movie) => {

    // User must be logged in
    if (!user || !token) {
      alert("Please log in to manage your watchlist.");
      navigate("/login");
      return;
    }

    const exists = watchlist.some(
      (item) => item.id === movie.id
    );

    try {
      let response: Response;

      // REMOVE MOVIE
      if (exists) {
        response = await fetch(
          `${API_URL}/watchlist/${movie.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // ADD MOVIE
      else {
        response = await fetch(
          `${API_URL}/watchlist`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              movie,
            }),
          }
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update watchlist."
        );
      }

      // Update frontend state using MongoDB response
      setWatchlist(data.movies || []);

    } catch (error) {
      console.error("Watchlist update error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while updating your watchlist."
      );
    }
  };

  // ========================================
  // APP UI AND ROUTES
  // ========================================

  return (
    <>
      {/* Navbar */}
      <Navbar />

      {/* Watchlist loading indicator */}
      {watchlistLoading && (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg border border-gray-700 bg-[#181818] px-4 py-2 text-sm text-white shadow-lg">
          Syncing your watchlist...
        </div>
      )}

      <Routes>

        {/* Home Page */}
        <Route
          path="/"
          element={
            <HomePage
              watchlist={watchlist}
              toggleWatchlist={toggleWatchlist}
            />
          }
        />

        {/* Movie Details Page */}
        <Route
          path="/movie/:movieId"
          element={<MovieDetails />}
        />

        {/* Search Results Page */}
        <Route
          path="/search"
          element={<SearchResults />}
        />

        {/* Login Page */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Register Page */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* Free Movies Catalogue */}
        <Route
          path="/free-movies"
          element={<PublicMovies />}
        />

        {/* Individual Movie Player */}
        <Route
          path="/watch/:movieId"
          element={<WatchMovie />}
        />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/my-list"
            element={
              <MyList
                watchlist={watchlist}
                toggleWatchlist={toggleWatchlist}
              />
            }
          />
        </Route>

        {/* 404 Page */}
        <Route
          path="*"
          element={
            <div className="flex min-h-screen items-center justify-center bg-[#080808] text-white">
              <div className="text-center">

                <h1 className="mb-4 text-4xl font-bold">
                  404
                </h1>

                <p className="mb-6 text-gray-400">
                  Page not found.
                </p>

                <button
                  onClick={() => navigate("/")}
                  className="rounded-lg bg-red-600 px-6 py-3 transition hover:bg-red-700"
                >
                  Go Home
                </button>

              </div>
            </div>
          }
        />

      </Routes>
    </>
  );
}

// ==========================================
// MAIN APP
// ==========================================

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
