
import { Star, Plus, Check } from "lucide-react";
import type { Movie } from "../data/movies";

interface MovieCardProps {
  movie: Movie;
  isInWatchlist: boolean;
  onToggleWatchlist: (movie: Movie) => void;
  onSelectMovie: (movie: Movie) => void;
}

function MovieCard({
  movie,
  isInWatchlist,
  onToggleWatchlist,
  onSelectMovie,
}: MovieCardProps) {
  return (
    <div
      onClick={() => onSelectMovie(movie)}
      className="group relative w-[115px] sm:w-[130px] md:w-[145px] lg:w-[155px] flex-shrink-0 cursor-pointer transition-all duration-300 hover:-translate-y-1"
    >
      {/* Movie Poster */}
      <div className="relative overflow-hidden rounded-lg aspect-[2/3] shadow-lg shadow-black/30">

        <img
          src={movie.poster}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Watchlist Button */}
        <button
          onClick={(event) => {
            event.stopPropagation();
            onToggleWatchlist(movie);
          }}
          aria-label={
            isInWatchlist
              ? `Remove ${movie.title} from watchlist`
              : `Add ${movie.title} to watchlist`
          }
          className="absolute top-2 right-2 bg-black/75 backdrop-blur-sm p-1.5 rounded-full text-white hover:bg-red-600 transition-all duration-300"
        >
          {isInWatchlist ? (
            <Check size={14} />
          ) : (
            <Plus size={14} />
          )}
        </button>

        {/* Rating */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Star
            size={12}
            className="text-yellow-400 fill-yellow-400"
          />
          {movie.rating}
        </div>

      </div>

      {/* Movie Details */}
      <div className="mt-2 px-0.5">

        <h3 className="text-white font-semibold text-xs sm:text-sm truncate group-hover:text-red-400 transition-colors">
          {movie.title}
        </h3>

        <p className="text-gray-500 text-[10px] sm:text-xs mt-1 truncate">
          {movie.year} • {movie.genre}
        </p>

      </div>
    </div>
  );
}

export default MovieCard;
