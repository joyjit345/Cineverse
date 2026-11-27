
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Star, ArrowLeft } from "lucide-react";

import { searchMovies } from "../services/tmdb";
import type { Movie } from "../data/movies";

function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = searchParams.get("query") || "";

  const [searchInput, setSearchInput] = useState(query);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Keep the input synchronized with the URL
  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  // Fetch movies whenever the search query changes
  useEffect(() => {
    let cancelled = false;

    async function loadMovies() {
      if (!query.trim()) {
        setMovies([]);
        setLoading(false);
        setError("");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const results = await searchMovies(query);

        if (!cancelled) {
          setMovies(results);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Something went wrong while searching. Please try again.");
          setMovies([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMovies();

    return () => {
      cancelled = true;
    };
  }, [query]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = searchInput.trim();

    if (!trimmedQuery) {
      setSearchParams({});
      return;
    }

    setSearchParams({ query: trimmedQuery });
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white px-5 sm:px-8 md:px-12 pt-28 pb-16">

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-8"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* Search Form */}
      <form
        onSubmit={handleSearch}
        className="flex max-w-2xl mb-10"
      >
        <input
          type="text"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search movies..."
          className="flex-1 min-w-0 bg-[#1c1c1c] border border-gray-700 rounded-l-lg px-5 py-3 outline-none focus:border-red-600"
        />

        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 px-5 rounded-r-lg transition"
          aria-label="Search movies"
        >
          <Search size={22} />
        </button>
      </form>

      {/* Page Heading */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">
          {query
            ? `Search Results for "${query}"`
            : "Search Movies"}
        </h1>

        {!loading && query && (
          <p className="text-gray-400 mt-2">
            {movies.length} movies found
          </p>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <p className="text-red-400 text-center py-16">
          {error}
        </p>
      )}

      {/* Empty Query */}
      {!loading && !error && !query && (
        <div className="text-center py-20">
          <Search size={48} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold">
            Find your next favourite movie
          </h2>
          <p className="text-gray-400 mt-2">
            Enter a movie title in the search box above.
          </p>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && query && movies.length === 0 && (
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold">
            No movies found
          </h2>
          <p className="text-gray-400 mt-2">
            Try searching with another movie title.
          </p>
        </div>
      )}

      {/* Movie Results Grid */}
      {!loading && !error && movies.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="group cursor-pointer"
              onClick={() => navigate(`/movie/${movie.id}`)}
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-900">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />

                <div className="absolute bottom-3 left-3 flex items-center gap-1 text-sm opacity-0 group-hover:opacity-100 transition">
                  <Star
                    size={15}
                    className="text-yellow-400 fill-yellow-400"
                  />
                  {movie.rating}
                </div>
              </div>

              <h3 className="text-white font-semibold mt-3 truncate group-hover:text-red-500 transition">
                {movie.title}
              </h3>

              <p className="text-gray-400 text-xs mt-1">
                {movie.year} • {movie.genre}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchResults;
