
import { useNavigate } from "react-router-dom";
import { Bookmark, Film, Clapperboard, Compass } from "lucide-react";

import MovieCard from "../components/MovieCard";
import type { Movie } from "../data/movies";
import { useAuth } from "../context/AuthContext";

interface MyListProps {
  watchlist: Movie[];
  toggleWatchlist: (movie: Movie) => void;
}

function MyList({
  watchlist,
  toggleWatchlist,
}: MyListProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get IDs of saved movies
  const watchlistIds = watchlist.map(
    (movie) => movie.id
  );

  // Navigate to movie details
  const handleSelectMovie = (movie: Movie) => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white pt-28 px-6 md:px-10 lg:px-16 pb-16">

      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="mb-10">

        <div className="flex items-center gap-3 mb-3">

          <Bookmark
            className="text-red-500"
            size={30}
          />

          <h1 className="text-3xl md:text-4xl font-bold">
            My List
          </h1>

        </div>

        <p className="text-gray-400">
          {user
            ? `Welcome back, ${user.name}. Your personal movie collection is waiting for you.`
            : "Your personal collection of favourite movies."}
        </p>

        <div className="flex items-center gap-2 mt-4 text-gray-500 text-sm">

          <Film size={16} />

          <span>
            {watchlist.length}{" "}
            {watchlist.length === 1 ? "movie" : "movies"} saved
          </span>

        </div>

      </div>

      {/* ======================================
          EMPTY WATCHLIST
      ====================================== */}

      {watchlist.length === 0 && (

        <div className="flex flex-col items-center justify-center text-center py-20 px-4">

          <div className="w-24 h-24 rounded-full bg-[#181818] border border-gray-800 flex items-center justify-center mb-7">

            <Clapperboard
              size={45}
              className="text-gray-500"
            />

          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Your list is empty
          </h2>

          <p className="text-gray-400 max-w-md mb-8 leading-relaxed">
            You haven't saved any movies yet.
            Explore CineVerse, discover amazing films,
            and add your favourites to your personal collection.
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-7 py-3 rounded-lg font-semibold transition duration-300"
          >
            <Compass size={18} />
            Browse Movies
          </button>

        </div>

      )}

      {/* ======================================
          SAVED MOVIES GRID
      ====================================== */}

      {watchlist.length > 0 && (

        <>

          <div className="flex items-center justify-between mb-6">

            <h2 className="text-xl font-semibold">
              Your Collection
            </h2>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-sm text-red-400 hover:text-red-300 transition"
            >
              Discover More →
            </button>

          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-10">

            {watchlist.map((movie) => (

              <div
                key={movie.id}
                className="min-w-0"
              >

                <MovieCard
                  movie={movie}
                  isInWatchlist={watchlistIds.includes(movie.id)}
                  onToggleWatchlist={toggleWatchlist}
                  onSelectMovie={handleSelectMovie}
                />

              </div>

            ))}

          </div>

        </>

      )}

    </div>
  );
}

export default MyList;
