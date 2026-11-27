
import { useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Film,
} from "lucide-react";

import type { Movie } from "../data/movies";
import MovieCard from "./MovieCard";

interface MovieCarouselProps {
  title: string;
  movies: Movie[];
  watchlistIds: number[];
  onToggleWatchlist: (movie: Movie) => void;
  onSelectMovie: (movie: Movie) => void;
}

function MovieCarousel({
  title,
  movies,
  watchlistIds,
  onToggleWatchlist,
  onSelectMovie,
}: MovieCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check carousel scroll position
  const updateScrollButtons = () => {
    const container = carouselRef.current;

    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 5);

    setCanScrollRight(
      container.scrollLeft + container.clientWidth <
        container.scrollWidth - 5
    );
  };

  // Scroll movies horizontally
  const scrollCarousel = (direction: "left" | "right") => {
    const container = carouselRef.current;

    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;

    container.scrollBy({
      left:
        direction === "left"
          ? -scrollAmount
          : scrollAmount,
      behavior: "smooth",
    });

    setTimeout(updateScrollButtons, 400);
  };

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <section className="relative mt-14 mb-12 group/carousel">

      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 px-1">

        <div className="flex items-center gap-3">

          {/* Red Accent */}
          <div className="w-1 h-8 bg-red-600 rounded-full shadow-[0_0_12px_rgba(220,38,38,0.6)]" />

          <div>
            <h2 className="text-white text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight">
              {title}
            </h2>

            <p className="text-gray-500 text-xs md:text-sm mt-1">
              Explore our collection
            </p>
          </div>

        </div>

        {/* View All */}
        <button
          className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition-all duration-300 text-sm font-semibold group/view"
          aria-label={`View all ${title}`}
        >
          <span>View All</span>

          <ArrowRight
            size={17}
            className="group-hover/view:translate-x-1 transition-transform"
          />
        </button>

      </div>

      {/* Carousel Wrapper */}
      <div className="relative">

        {/* Left Gradient */}
        <div className="absolute left-0 top-0 bottom-5 w-12 bg-gradient-to-r from-[#080808] to-transparent z-10 pointer-events-none" />

        {/* Left Navigation */}
        {canScrollLeft && (
          <button
            onClick={() => scrollCarousel("left")}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-black/80 border border-white/20 text-white shadow-xl backdrop-blur-md hover:bg-red-600 hover:border-red-500 hover:scale-110 transition-all duration-300"
            aria-label="Scroll left"
          >
            <ChevronLeft size={26} />
          </button>
        )}

        {/* Movie List */}
        <div
          ref={carouselRef}
          onScroll={updateScrollButtons}
          className="flex gap-5 overflow-x-auto overflow-y-hidden pb-6 pt-2 px-1 snap-x snap-mandatory scroll-smooth movie-carousel"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >

          {movies.map((movie) => (
            <div
              key={movie.id}
              className="flex-shrink-0 snap-start transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]"
            >
              <MovieCard
                movie={movie}
                isInWatchlist={watchlistIds.includes(movie.id)}
                onToggleWatchlist={onToggleWatchlist}
                onSelectMovie={onSelectMovie}
              />
            </div>
          ))}

        </div>

        {/* Right Gradient */}
        <div className="absolute right-0 top-0 bottom-5 w-12 bg-gradient-to-l from-[#080808] to-transparent z-10 pointer-events-none" />

        {/* Right Navigation */}
        {canScrollRight && (
          <button
            onClick={() => scrollCarousel("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-black/80 border border-white/20 text-white shadow-xl backdrop-blur-md hover:bg-red-600 hover:border-red-500 hover:scale-110 transition-all duration-300"
            aria-label="Scroll right"
          >
            <ChevronRight size={26} />
          </button>
        )}

      </div>

      {/* Bottom Section Indicator */}
      <div className="flex items-center gap-2 mt-1">

        <Film size={13} className="text-red-500" />

        <span className="text-gray-500 text-xs">
          {movies.length} movies available
        </span>

      </div>

    </section>
  );
}

export default MovieCarousel;
