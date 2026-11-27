import { Link } from "react-router-dom";
import { Film, Play, Clock } from "lucide-react";
import { publicMovies } from "../data/publicMovies";

function PublicMovies() {
  return (
    <main className="min-h-screen bg-[#080808] px-5 pb-16 pt-28 text-white md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
            CineVerse Originals & Classics
          </p>

          <h1 className="text-4xl font-extrabold md:text-5xl">
            Free <span className="text-red-500">Movies</span>
          </h1>

          <p className="mt-4 max-w-2xl text-gray-400">
            Explore films that are available to watch online. Check each
            film's rights and licence before redistributing it.
          </p>
        </div>

        {publicMovies.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <Film className="mx-auto mb-4 text-gray-500" size={42} />
            <h2 className="text-xl font-bold">No movies available yet</h2>
            <p className="mt-2 text-gray-400">
              Add movies to src/data/publicMovies.ts to display them here.
            </p>
          </div>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {publicMovies.map((movie) => (
              <article
                key={movie.id}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-[#151515] transition hover:-translate-y-1 hover:border-red-500/60"
              >
                <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-[#341010] via-[#171717] to-black">
                  <Film
                    size={58}
                    className="text-red-500 transition group-hover:scale-110"
                  />
                </div>

                <div className="p-5">
                  <div className="mb-3 flex items-center gap-3 text-xs text-gray-400">
                    <span className="rounded bg-red-600 px-2 py-1 font-bold text-white">
                      FREE
                    </span>
                    <span>{movie.year}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      {movie.duration}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold">{movie.title}</h2>

                  <p className="mt-3 line-clamp-3 min-h-[72px] text-sm leading-6 text-gray-400">
                    {movie.description}
                  </p>

                  <Link
                    to={`/watch/${movie.id}`}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 font-semibold transition hover:bg-red-700"
                  >
                    <Play size={18} fill="currentColor" />
                    Watch Now
                  </Link>

                  <a
                    href={movie.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 block text-center text-xs text-gray-500 underline hover:text-white"
                  >
                    View source and rights information
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default PublicMovies;