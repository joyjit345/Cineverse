import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  Film,
  AlertCircle,
} from "lucide-react";
import { publicMovies } from "../data/publicMovies";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function WatchMovie() {
  const { movieId } = useParams<{ movieId: string }>();
  const movie = publicMovies.find((item) => item.id === movieId);

  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSavedTime = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasError, setHasError] = useState(false);

  const progressKey = movie
    ? `cineverse-progress-${movie.id}`
    : "";

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !movie) return;

    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setHasError(false);
    lastSavedTime.current = 0;

    const restoreProgress = () => {
      const savedProgress = Number(
        localStorage.getItem(progressKey) || 0
      );

      if (
        Number.isFinite(savedProgress) &&
        savedProgress > 5 &&
        savedProgress < video.duration - 10
      ) {
        video.currentTime = savedProgress;
        setCurrentTime(savedProgress);
      }

      setDuration(video.duration);
    };

    video.addEventListener("loadedmetadata", restoreProgress);

    return () => {
      video.removeEventListener("loadedmetadata", restoreProgress);

      if (Number.isFinite(video.currentTime) && video.currentTime > 0) {
        localStorage.setItem(progressKey, String(video.currentTime));
      }
    };
  }, [movie, progressKey]);

  const saveProgress = () => {
    const video = videoRef.current;

    if (!video || !movie || !Number.isFinite(video.currentTime)) return;

    localStorage.setItem(progressKey, String(video.currentTime));
  };

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (video.paused) {
        await video.play();
      } else {
        video.pause();
      }
    } catch {
      setHasError(true);
    }
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(
      0,
      Math.min(video.currentTime + seconds, video.duration || 0)
    );
  };

  const handleSeek = (value: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = value;
    setCurrentTime(value);
  };

  const handleVolume = (value: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = value;
    video.muted = value === 0;

    setVolume(value);
    setIsMuted(value === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const toggleFullscreen = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (!document.fullscreenElement) {
        await video.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen may not be supported by every browser.
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;

      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        void togglePlay();
      }

      if (event.code === "ArrowLeft") skip(-10);
      if (event.code === "ArrowRight") skip(10);

      if (event.code === "KeyM") toggleMute();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  if (!movie) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] px-5 text-center text-white">
        <div>
          <Film size={55} className="mx-auto mb-5 text-red-500" />
          <h1 className="text-3xl font-bold">Movie not found</h1>
          <p className="mt-3 text-gray-400">
            This movie is not available in the CineVerse catalogue.
          </p>
          <Link
            to="/free-movies"
            className="mt-6 inline-block rounded-lg bg-red-600 px-6 py-3 font-semibold hover:bg-red-700"
          >
            Browse Free Movies
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] px-4 pb-16 pt-24 text-white md:px-10">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/free-movies"
          className="mb-7 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
        >
          <ArrowLeft size={18} />
          Back to Free Movies
        </Link>

        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-500">
            Now Playing
          </p>
          <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
            {movie.title}
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            {movie.year} · {movie.duration}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl shadow-red-950/20">
          <div className="relative aspect-video bg-black">
            <video
              ref={videoRef}
              className="h-full w-full"
              src={movie.videoUrl}
              playsInline
              preload="metadata"
              onPlay={() => setIsPlaying(true)}
              onPause={() => {
                setIsPlaying(false);
                saveProgress();
              }}
              onTimeUpdate={() => {
                const video = videoRef.current;
                if (!video) return;

                setCurrentTime(video.currentTime);

                if (video.currentTime - lastSavedTime.current >= 5) {
                  saveProgress();
                  lastSavedTime.current = video.currentTime;
                }
              }}
              onLoadedMetadata={() => {
                const video = videoRef.current;
                if (video && Number.isFinite(video.duration)) {
                  setDuration(video.duration);
                }
              }}
              onEnded={() => {
                setIsPlaying(false);
                localStorage.removeItem(progressKey);
              }}
              onError={() => setHasError(true)}
            />

            {hasError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-6 text-center">
                <AlertCircle size={42} className="mb-4 text-red-500" />
                <h2 className="text-xl font-bold">Unable to play this video</h2>
                <p className="mt-2 max-w-md text-sm text-gray-400">
                  The source may be unavailable or may not allow direct
                  playback. Try opening the original source.
                </p>
                <a
                  href={movie.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 rounded-lg bg-red-600 px-5 py-3 font-semibold hover:bg-red-700"
                >
                  Open Video Source
                </a>
              </div>
            )}
          </div>

          <div className="space-y-4 bg-[#141414] p-4 md:p-5">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(currentTime, duration || 0)}
              onChange={(event) => handleSeek(Number(event.target.value))}
              aria-label="Seek video"
              className="h-1.5 w-full cursor-pointer accent-red-600"
            />

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 md:gap-5">
                <button
                  onClick={() => skip(-10)}
                  aria-label="Back 10 seconds"
                  className="text-gray-300 hover:text-red-500"
                >
                  <SkipBack size={22} />
                </button>

                <button
                  onClick={() => void togglePlay()}
                  aria-label={isPlaying ? "Pause" : "Play"}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white transition hover:scale-105 hover:bg-red-700"
                >
                  {isPlaying ? (
                    <Pause size={21} fill="currentColor" />
                  ) : (
                    <Play size={21} fill="currentColor" />
                  )}
                </button>

                <button
                  onClick={() => skip(10)}
                  aria-label="Forward 10 seconds"
                  className="text-gray-300 hover:text-red-500"
                >
                  <SkipForward size={22} />
                </button>

                <span className="text-xs tabular-nums text-gray-400">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-3 md:gap-5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    aria-label={isMuted ? "Unmute" : "Mute"}
                    className="text-gray-300 hover:text-white"
                  >
                    {isMuted ? (
                      <VolumeX size={20} />
                    ) : (
                      <Volume2 size={20} />
                    )}
                  </button>

                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={(event) =>
                      handleVolume(Number(event.target.value))
                    }
                    aria-label="Volume"
                    className="w-16 cursor-pointer accent-red-600 md:w-24"
                  />
                </div>

                <select
                  value={playbackRate}
                  onChange={(event) =>
                    changePlaybackRate(Number(event.target.value))
                  }
                  aria-label="Playback speed"
                  className="rounded bg-[#252525] px-2 py-2 text-xs text-white outline-none"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>

                <button
                  onClick={() => void toggleFullscreen()}
                  aria-label="Fullscreen"
                  className="text-gray-300 hover:text-red-500"
                >
                  <Maximize size={21} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-white/10 bg-[#141414] p-6">
          <h2 className="text-xl font-bold">About This Movie</h2>
          <p className="mt-3 leading-7 text-gray-400">
            {movie.description}
          </p>

          <div className="mt-5 border-t border-white/10 pt-5 text-sm text-gray-400">
            <p>
              <span className="text-white">Video source:</span>{" "}
              {movie.source}
            </p>
            <p className="mt-2">
              <span className="text-white">Rights note:</span>{" "}
              {movie.license}
            </p>
            <a
              href={movie.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-red-500 underline hover:text-red-400"
            >
              Visit original source
            </a>
          </div>
        </section>

        <p className="mt-5 text-xs text-gray-600">
          Keyboard shortcuts: Space = Play/Pause · ←/→ = Skip 10 seconds ·
          M = Mute
        </p>
      </div>
    </main>
  );
}

export default WatchMovie;