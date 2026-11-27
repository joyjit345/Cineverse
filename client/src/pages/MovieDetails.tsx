import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Play, Star } from "lucide-react";

import {
  getMovieDetails,
  getMovieTrailer,
  type MovieDetails as MovieDetailsType,
} from "../services/tmdb";

import WhereToWatch from "../components/WhereToWatch";

function MovieDetails() {
  const { movieId } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<MovieDetailsType | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [playingTrailer, setPlayingTrailer] = useState(false);

  useEffect(() => {
    if (!movieId || !/^\d+$/.test(movieId)) {
      setError("Invalid movie ID.");
      setLoading(false);
      return;
    }

    const id = Number(movieId);
    let cancelled = false;

    async function loadMovie() {
      try {
        setLoading(true);
        setError("");

        const [details, trailer] = await Promise.all([
          getMovieDetails(id),
          getMovieTrailer(id),
        ]);

        if (!cancelled) {
          setMovie(details);
          setTrailerKey(trailer);
        }
      } catch (err) {
        console.error("Movie loading error:", err);

        if (!cancelled) {
          setError("Unable to load this movie. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMovie();

    return () => {
      cancelled = true;
    };
  }, [movieId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center text-white">
        Loading movie details...
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center text-white gap-5">
        <p>{error || "Movie not found."}</p>

        <button
          onClick={() => navigate("/")}
          className="bg-purple-600 px-5 py-2 rounded-lg"
        >
          Go Home
        </button>
      </div>
    );
  }

  const backdrop = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : "";

  const poster = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://placehold.co/500x750?text=No+Poster";

  return (
    <main className="min-h-screen bg-[#080808] text-white">

      {/* Movie Hero Section */}
      <section
        className="relative min-h-[85vh] bg-cover bg-center"
        style={{
          backgroundImage: backdrop
            ? `url(${backdrop})`
            : undefined,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/20" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-black/30" />

        <div className="relative z-10 px-6 md:px-16 pt-28 pb-16">

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-300 hover:text-white mb-12"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <div className="max-w-4xl">

            <p className="text-purple-400 font-semibold tracking-widest mb-4">
              CINEVERSE ORIGINAL EXPERIENCE
            </p>

            <h1 className="text-4xl md:text-7xl font-bold mb-4">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="text-gray-300 italic text-lg mb-5">
                {movie.tagline}
              </p>
            )}

            {/* Movie Rating and Details */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-7">

              <span className="flex items-center gap-1 text-yellow-400">
                <Star size={17} fill="currentColor" />
                {movie.vote_average.toFixed(1)} / 10
              </span>

              <span>
                {movie.release_date?.slice(0, 4) || "N/A"}
              </span>

              {movie.runtime > 0 && (
                <span>{movie.runtime} minutes</span>
              )}

            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-7">
              {movie.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="border border-gray-500 rounded-full px-4 py-1 text-sm"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            {/* Description */}
            <p className="text-gray-300 leading-7 max-w-2xl mb-9">
              {movie.overview || "No description available."}
            </p>

            {/* Trailer Button */}
            <button
              onClick={() => setPlayingTrailer(true)}
              disabled={!trailerKey}
              className="flex items-center gap-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-7 py-3 rounded-lg font-semibold transition"
            >
              <Play size={20} fill="currentColor" />

              {trailerKey
                ? "Play Trailer"
                : "Trailer Unavailable"}
            </button>

          </div>
        </div>
      </section>

      {/* Movie Information */}
      <section className="px-6 md:px-16 py-10">

        <h2 className="text-2xl font-bold mb-6">
          Movie Information
        </h2>

        <div className="flex flex-col md:flex-row gap-8">

          <img
            src={poster}
            alt={movie.title}
            className="w-48 rounded-xl shadow-lg"
          />

          <div className="space-y-3 text-gray-300">

            <p>
              <strong className="text-white">Title:</strong>{" "}
              {movie.title}
            </p>

            <p>
              <strong className="text-white">Release:</strong>{" "}
              {movie.release_date || "N/A"}
            </p>

            <p>
              <strong className="text-white">Runtime:</strong>{" "}
              {movie.runtime
                ? `${movie.runtime} minutes`
                : "N/A"}
            </p>

            <p>
              <strong className="text-white">Genres:</strong>{" "}
              {movie.genres.map((g) => g.name).join(", ")}
            </p>

          </div>
        </div>
      </section>

      {/* Where to Watch Section */}
      <div className="px-6 md:px-16 pb-12">
        <WhereToWatch movieId={movie.id} region="IN" />
      </div>

      {/* Trailer Player Modal */}
      {playingTrailer && trailerKey && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">

          <div className="w-full max-w-5xl">

            <div className="flex justify-end mb-3">
              <button
                onClick={() => setPlayingTrailer(false)}
                className="text-white hover:text-purple-400 text-lg"
              >
                Close ✕
              </button>
            </div>

            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                title={`${movie.title} trailer`}
                className="w-full h-full rounded-xl"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>

          </div>
        </div>
      )}

    </main>
  );
}

export default MovieDetails;