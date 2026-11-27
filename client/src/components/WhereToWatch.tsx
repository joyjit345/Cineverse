import { useEffect, useState } from "react";
import {
  ExternalLink,
  Tv,
  ShoppingCart,
  CircleDollarSign,
  LoaderCircle,
} from "lucide-react";

import {
  getMovieWatchProviders,
  type WatchProviderRegion,
} from "../services/tmdb";

interface WhereToWatchProps {
  movieId: number;
  region?: string;
}

type ProviderCategoryKey =
  | "free"
  | "ads"
  | "flatrate"
  | "rent"
  | "buy";

const providerCategories: {
  key: ProviderCategoryKey;
  title: string;
  description: string;
  icon: typeof Tv;
}[] = [
  {
    key: "free",
    title: "Free",
    description: "Watch without a subscription",
    icon: Tv,
  },
  {
    key: "ads",
    title: "Free with Ads",
    description: "Free streaming supported by advertisements",
    icon: Tv,
  },
  {
    key: "flatrate",
    title: "Stream",
    description: "Available with a subscription",
    icon: Tv,
  },
  {
    key: "rent",
    title: "Rent",
    description: "Rent the movie online",
    icon: CircleDollarSign,
  },
  {
    key: "buy",
    title: "Buy",
    description: "Purchase the movie online",
    icon: ShoppingCart,
  },
];

export default function WhereToWatch({
  movieId,
  region = "IN",
}: WhereToWatchProps) {
  const [providers, setProviders] =
    useState<WatchProviderRegion | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProviders() {
      setLoading(true);
      setError("");
      setProviders(null);

      try {
        const data = await getMovieWatchProviders(
          movieId,
          region
        );

        if (cancelled) return;

        const regionData = data.results?.[region];

        setProviders(regionData ?? null);
      } catch (err) {
        if (cancelled) return;

        console.error("Watch Providers Error:", err);

        setError(
          err instanceof Error ? err.message : "error"
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (movieId) {
      loadProviders();
    } else {
      setLoading(false);
      setError("error");
    }

    return () => {
      cancelled = true;
    };
  }, [movieId, region]);

  const availableCategories = providerCategories.filter(
    (category) => {
      const items = providers?.[category.key];

      return Array.isArray(items) && items.length > 0;
    }
  );

  // If the fetch failed, hide the whole section
  if (!loading && error) {
    return null;
  }

  return (
    <section className="mt-12 rounded-2xl border border-white/10 bg-zinc-900/70 p-6 md:p-8">

      {/* LOADING */}
      {loading && (
        <div className="flex items-center gap-3 py-8 text-zinc-400">
          <LoaderCircle className="h-6 w-6 animate-spin text-red-500" />

          <span>Finding available streaming platforms...</span>
        </div>
      )}

      {/* NO PROVIDERS */}
      {!loading && !error && availableCategories.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
          <Tv className="mx-auto mb-3 h-9 w-9 text-zinc-500" />

          <h3 className="font-semibold text-white">
            No Streaming Options Found
          </h3>

          <p className="mt-2 text-sm text-zinc-400">
            No legal viewing platforms are currently listed
            for this movie in India.
          </p>
        </div>
      )}

      {/* STREAMING PROVIDERS */}
      {!loading &&
        !error &&
        availableCategories.map((category) => {
          const Icon = category.icon;
          const items = providers?.[category.key];

          if (!Array.isArray(items) || items.length === 0) {
            return null;
          }

          return (
            <div key={category.key} className="mb-8 last:mb-0">

              {/* CATEGORY HEADER */}
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-red-500/10 p-2">
                  <Icon className="h-5 w-5 text-red-500" />
                </div>

                <div>
                  <h3 className="font-semibold text-white">
                    {category.title}
                  </h3>

                  <p className="text-xs text-zinc-500">
                    {category.description}
                  </p>
                </div>
              </div>

              {/* PROVIDER CARDS */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {items.map((provider) => (
                  <div
                    key={provider.provider_id}
                    className="flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-3 transition hover:border-red-500/50"
                  >
                    {provider.logo_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                        alt={provider.provider_name}
                        className="h-11 w-11 shrink-0 rounded-lg object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                        <Tv className="h-5 w-5 text-zinc-400" />
                      </div>
                    )}

                    <span className="break-words text-sm font-medium text-white">
                      {provider.provider_name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

      {/* JUSTWATCH LINK */}
      {!loading && !error && providers?.link && (
        <a
          href={providers.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          View All Watch Options

          <ExternalLink className="h-4 w-4" />
        </a>
      )}

    </section>
  );
}