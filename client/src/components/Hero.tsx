
import {
  Play,
  Info,
  Star,
  Clapperboard,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTrendingMovies, getMovieTrailer } from "../services/tmdb";
import type { Movie } from "../data/movies";

// YouTube IFrame API types
type YouTubePlayer = {
  mute: () => void;
  unMute: () => void;
  setVolume: (volume: number) => void;
  playVideo: () => void;
  destroy: () => void;
};

type YouTubeAPI = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      playerVars: Record<string, string | number>;
      events: {
        onReady: () => void;
        onError?: () => void;
      };
    }
  ) => YouTubePlayer;
};

declare global {
  interface Window {
    YT?: YouTubeAPI;
    onYouTubeIframeAPIReady?: () => void;
  }
}

// Load YouTube API only once
let youtubeApiPromise: Promise<YouTubeAPI> | null = null;

function loadYouTubeAPI(): Promise<YouTubeAPI> {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve, reject) => {
      const previousCallback = window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady = () => {
        previousCallback?.();

        if (window.YT) {
          resolve(window.YT);
        } else {
          reject(new Error("YouTube API failed to initialize."));
        }
      };

      let script = document.querySelector<HTMLScriptElement>(
        'script[src="https://www.youtube.com/iframe_api"]'
      );

      if (!script) {
        script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;

        script.onerror = () => {
          reject(new Error("Failed to load YouTube API."));
        };

        document.head.appendChild(script);
      }
    });
  }

  return youtubeApiPromise;
}

function Hero() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);

  const [isMuted, setIsMuted] = useState(true);
  const [playerReady, setPlayerReady] = useState(false);

  const playerRef = useRef<YouTubePlayer | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();

  const activeMovie = movies[activeIndex];

  // Fetch trending movies
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await getTrendingMovies();
        setMovies(data);
      } catch (error) {
        console.error("Failed to load trending movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Fetch trailer whenever active movie changes
  useEffect(() => {
    if (!activeMovie) {
      setTrailerKey(null);
      return;
    }

    let cancelled = false;

    setTrailerKey(null);
    setIsMuted(true);
    setPlayerReady(false);

    const fetchTrailer = async () => {
      try {
        const key = await getMovieTrailer(activeMovie.id);

        if (!cancelled) {
          setTrailerKey(key);
        }
      } catch (error) {
        console.error("Failed to load movie trailer:", error);

        if (!cancelled) {
          setTrailerKey(null);
        }
      }
    };

    fetchTrailer();

    return () => {
      cancelled = true;
    };
  }, [activeMovie?.id]);

  // Initialize YouTube player
  useEffect(() => {
    if (!trailerKey || !playerContainerRef.current) return;

    let cancelled = false;

    setIsMuted(true);
    setPlayerReady(false);

    const initializePlayer = async () => {
      try {
        const YT = await loadYouTubeAPI();

        if (cancelled || !playerContainerRef.current) return;

        const player = new YT.Player(playerContainerRef.current, {
          videoId: trailerKey,

          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            loop: 1,
            playlist: trailerKey,
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
            mute: 1,
          },

          events: {
            onReady: () => {
              if (cancelled) {
                player.destroy();
                return;
              }

              player.mute();
              player.setVolume(70);
              setPlayerReady(true);
            },

            onError: () => {
              setPlayerReady(false);
              console.error("YouTube trailer playback failed.");
            },
          },
        });

        playerRef.current = player;
      } catch (error) {
        console.error("YouTube player initialization failed:", error);
      }
    };

    initializePlayer();

    return () => {
      cancelled = true;

      playerRef.current?.destroy();
      playerRef.current = null;

      setPlayerReady(false);
    };
  }, [trailerKey]);

  // Toggle original trailer audio
  const toggleTrailerAudio = () => {
    const player = playerRef.current;

    if (!player || !playerReady) return;

    if (isMuted) {
      player.unMute();
      player.setVolume(70);
      player.playVideo();

      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  };

  // Automatically change movie every 60 seconds
  useEffect(() => {
    if (movies.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveIndex((currentIndex) => {
        return (currentIndex + 1) % movies.length;
      });
    }, 60000);

    return () => window.clearInterval(interval);
  }, [movies.length]);

  // Reset More Info when movie changes
  useEffect(() => {
    setShowInfo(false);
  }, [activeIndex]);

  // Next movie
  const nextMovie = () => {
    if (movies.length === 0) return;

    setActiveIndex((index) => (index + 1) % movies.length);
  };

  // Previous movie
  const previousMovie = () => {
    if (movies.length === 0) return;

    setActiveIndex(
      (index) => (index - 1 + movies.length) % movies.length
    );
  };

  // Loading screen
  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#080808]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

          <p className="text-gray-400">
            Loading featured movies...
          </p>
        </div>
      </section>
    );
  }

  // Empty state
  if (movies.length === 0) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#080808]">
        <p className="text-gray-400">
          Unable to load featured movies. Please try again.
        </p>
      </section>
    );
  }

  const movie = movies[activeIndex]!;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#080808]">

      {/* Background Image Fallback */}
      <div
        key={movie.id}
        className="absolute inset-0 bg-cover bg-center scale-105 transition-opacity duration-1000 animate-in fade-in"
        style={{
          backgroundImage: `url("${movie.poster}")`,
        }}
      />

      {/* YouTube Trailer Background */}
      {trailerKey && (
        <div className="absolute inset-0 overflow-hidden">
          <div
            ref={playerContainerRef}
            className="absolute top-1/2 left-1/2 pointer-events-none"
            style={{
              width: "100vw",
              height: "56.25vw",
              minWidth: "177.78vh",
              minHeight: "100vh",
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>
      )}

      {/* Cinematic Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/20" />

      <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-black/40" />

      <div className="absolute inset-0 bg-black/20" />

      {/* Trailer Audio Button */}
      {trailerKey && (
        <button
          onClick={toggleTrailerAudio}
          disabled={!playerReady}
          aria-label={
            isMuted ? "Unmute trailer audio" : "Mute trailer audio"
          }
          title={
            !playerReady
              ? "Loading trailer..."
              : isMuted
              ? "Enable original trailer audio"
              : "Mute trailer audio"
          }
          className="absolute top-28 right-6 sm:right-10 lg:right-12 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-black/60 border border-white/20 text-white backdrop-blur-md hover:bg-red-600 hover:border-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isMuted ? (
            <VolumeX size={22} />
          ) : (
            <Volume2 size={22} />
          )}
        </button>
      )}

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-10 lg:px-12 pt-28 pb-24">

        <div
          key={`content-${movie.id}`}
          className="max-w-3xl animate-in fade-in duration-700"
        >

          {/* Featured Badge */}
          <div className="flex items-center gap-3 mb-7">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider">
              Trending Now
            </span>

            <span className="flex items-center gap-2 text-gray-300 text-sm font-medium tracking-[0.2em] uppercase">
              <Clapperboard size={16} className="text-red-500" />
              CineVerse Featured
            </span>
          </div>

          {/* Movie Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-red-500 mb-6 tracking-tighter leading-none drop-shadow-2xl">
            {movie.title}
          </h1>

          {/* Movie Information */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-gray-300 mb-7">

            <span className="flex items-center gap-1.5 text-green-400 font-bold">
              <Star size={17} fill="currentColor" />
              {Number(movie.rating).toFixed(1)}/10
            </span>

            <span className="text-gray-500">|</span>

            <span>{movie.year}</span>

            <span className="text-gray-500">|</span>

            <span className="border border-gray-500/70 px-2 py-1 rounded text-xs">
              Movie
            </span>

            <span className="text-gray-300">
              {movie.genre}
            </span>

          </div>

          {/* Movie Description */}
          <p className="text-gray-300 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mb-9 line-clamp-4">
            {movie.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">

            <button
              onClick={() => navigate(`/movie/${movie.id}`)}
              className="group flex items-center gap-3 bg-red-600 text-white px-8 py-4 rounded-md font-bold text-base hover:bg-red-700 hover:scale-105 transition-all duration-300 shadow-lg shadow-red-600/20"
            >
              <Play
                size={21}
                fill="white"
                className="group-hover:scale-110 transition-transform"
              />

              Explore Movie
            </button>

            <button
              onClick={() => setShowInfo(!showInfo)}
              className="flex items-center gap-3 bg-white/10 border border-white/20 text-white px-8 py-4 rounded-md font-bold text-base backdrop-blur-md hover:bg-white/20 transition-all duration-300"
            >
              <Info size={21} />

              {showInfo ? "Hide Info" : "More Info"}
            </button>

          </div>

          {/* Additional Movie Information */}
          {showInfo && (
            <div className="mt-8 p-6 max-w-2xl bg-black/75 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl">

              <h3 className="text-xl font-bold text-white mb-3">
                About {movie.title}
              </h3>

              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {movie.description}
              </p>

              <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap gap-6 text-sm">

                <p className="text-gray-400">
                  Release Year:{" "}
                  <span className="text-white font-semibold">
                    {movie.year}
                  </span>
                </p>

                <p className="text-gray-400">
                  Rating:{" "}
                  <span className="text-white font-semibold">
                    {Number(movie.rating).toFixed(1)}/10
                  </span>
                </p>

                <p className="text-gray-400">
                  Genre:{" "}
                  <span className="text-white font-semibold">
                    {movie.genre}
                  </span>
                </p>

              </div>
            </div>
          )}

        </div>

        {/* Carousel Controls */}
        <div className="mt-14 flex items-center justify-between max-w-3xl">

          {/* Indicator Dots */}
          <div className="flex items-center gap-2">

            {movies.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setActiveIndex(index)}
                aria-label={`Show ${item.title}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? "w-10 bg-red-600"
                    : "w-5 bg-white/30 hover:bg-white/70"
                }`}
              />
            ))}

            <span className="text-gray-400 text-xs uppercase tracking-[0.2em] ml-3">
              {activeIndex + 1} / {movies.length}
            </span>

          </div>

          {/* Previous / Next Buttons */}
          <div className="flex items-center gap-3">

            <button
              onClick={previousMovie}
              aria-label="Previous movie"
              className="p-3 rounded-full border border-white/20 bg-black/40 text-white hover:bg-red-600 hover:border-red-600 transition-all"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              onClick={nextMovie}
              aria-label="Next movie"
              className="p-3 rounded-full border border-white/20 bg-black/40 text-white hover:bg-red-600 hover:border-red-600 transition-all"
            >
              <ChevronRight size={22} />
            </button>

          </div>
        </div>

      </div>
    </section>
  );
}

export default Hero;
