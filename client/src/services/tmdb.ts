
import type { Movie } from "../data/movies";

// TMDB Movie Interface
interface TMDBMovie {
  id: number;
  adult: boolean;
  title: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  poster_path: string | null;
  overview: string;
}

// TMDB API Response Interface
interface TMDBResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

// Convert TMDB movie into our Movie format
function formatMovie(
  movie: TMDBMovie,
  genreOverride?: string
): Movie {
  const genre =
    genreOverride ??
    (movie.genre_ids?.includes(28)
      ? "Action"
      : movie.genre_ids?.includes(878)
      ? "Sci-Fi"
      : movie.genre_ids?.includes(18)
      ? "Drama"
      : "Other");

  return {
    id: movie.id,
    title: movie.title,
    year: movie.release_date
      ? Number(movie.release_date.slice(0, 4))
      : 0,
    rating: Number(movie.vote_average.toFixed(1)),
    genre,
    poster: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "https://placehold.co/500x750?text=No+Poster",
    description: movie.overview || "No description available.",
  };
}

// Reusable API fetching function
async function fetchMovies(
  endpoint: string,
  genreOverride?: string
): Promise<Movie[]> {
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(
      `Movie API request failed: ${response.status}`
    );
  }

  const data: TMDBResponse = await response.json();

  if (!Array.isArray(data.results)) {
    throw new Error("Invalid movie response from server.");
  }

  return data.results.map((movie) =>
    formatMovie(movie, genreOverride)
  );
}

// Popular Movies
export function getPopularMovies(): Promise<Movie[]> {
  return fetchMovies("/api/movies/popular");
}

// Trending Movies
export function getTrendingMovies(): Promise<Movie[]> {
  return fetchMovies("/api/movies/trending");
}

// Action Movies
export function getActionMovies(): Promise<Movie[]> {
  return fetchMovies("/api/movies/genre/28", "Action");
}

// Sci-Fi Movies
export function getSciFiMovies(): Promise<Movie[]> {
  return fetchMovies("/api/movies/genre/878", "Sci-Fi");
}

// Drama Movies
export function getDramaMovies(): Promise<Movie[]> {
  return fetchMovies("/api/movies/genre/18", "Drama");
}

// Movie Recommendations
export function getMovieRecommendations(
  movieId: number
): Promise<Movie[]> {
  return fetchMovies(
    `/api/movies/${movieId}/recommendations`
  );
}

// Search Movies
export async function searchMovies(
  query: string
): Promise<Movie[]> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const response = await fetch(
    `/api/movies/search?query=${encodeURIComponent(trimmedQuery)}`
  );

  if (!response.ok) {
    throw new Error("Unable to search movies.");
  }

  const data: TMDBResponse = await response.json();

  if (!Array.isArray(data.results)) {
    throw new Error("Invalid search response.");
  }

  return data.results
    .filter((movie) => !movie.adult)
    .map((movie) => formatMovie(movie));
}

// Movie Details Interface
export interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  vote_average: number;
  runtime: number;
  backdrop_path: string | null;
  poster_path: string | null;
  tagline: string;
  genres: { id: number; name: string }[];
}

// TMDB Video Interface
interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

interface TMDBVideosResponse {
  results: TMDBVideo[];
}

// Fetch individual movie details
export async function getMovieDetails(
  movieId: number
): Promise<MovieDetails> {
  const response = await fetch(
    `/api/movies/${movieId}`
  );

  if (!response.ok) {
    throw new Error("Unable to fetch movie details.");
  }

  return response.json();
}

// Fetch an official YouTube trailer
export async function getMovieTrailer(
  movieId: number
): Promise<string | null> {
  const response = await fetch(
    `/api/movies/${movieId}/videos`
  );

  if (!response.ok) {
    throw new Error("Unable to fetch movie videos.");
  }

  const data: TMDBVideosResponse = await response.json();

  const videos = data.results.filter(
    (video) => video.site === "YouTube"
  );

  const trailer =
    videos.find(
      (video) => video.type === "Trailer" && video.official
    ) ??
    videos.find(
      (video) => video.type === "Trailer"
    ) ??
    videos.find(
      (video) => video.type === "Teaser"
    );

  return trailer?.key ?? null;
}

// ======================================
// MOVIE WATCH PROVIDERS
// ======================================

// Watch Provider Interface
export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

// Watch Provider Region Interface
export interface WatchProviderRegion {
  link: string;
  free?: WatchProvider[];
  ads?: WatchProvider[];
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

// Watch Providers API Response Interface
export interface WatchProvidersResponse {
  id: number;
  results: {
    [region: string]: WatchProviderRegion;
  };
}

// Fetch legal streaming, rental and purchase options
export async function getMovieWatchProviders(
  movieId: number,
  region: string = "IN"
): Promise<WatchProvidersResponse> {
  const response = await fetch(
    `/api/movies/${movieId}/providers?region=${encodeURIComponent(region)}`
  );

  if (!response.ok) {
    throw new Error("Unable to fetch movie watch providers.");
  }

  return response.json();
}

