
"use client";

import { useWatchHistory } from "@/lib/useWatchHistory";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ContinueWatching() {
  const { getGroupedHistory } = useWatchHistory();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const groupedHistory = getGroupedHistory();
  if (groupedHistory.length === 0) return null;

  const recentAnime = groupedHistory.slice(0, 6);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="industrial-border">
          <h2 className="text-xl font-bold tracking-tight uppercase">Continue Watching</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Pick up where you left off</p>
        </div>
        <Link
          href="/history"
          className="text-xs font-semibold uppercase tracking-widest px-3 py-2 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {recentAnime.map((anime) => {
          const episodeId = anime.latestEpisode.episodeId;
          const episodeCount = anime.episodes.length;

          return (
            <Link key={anime.animeId} href={`/episode/${episodeId}`} className="group block">
              <div className="border border-border bg-card hover:border-primary transition-colors">

                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={anime.poster}
                    alt={anime.animeTitle}
                    fill
                    sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  {/* Episode count badge */}
                  {episodeCount > 1 && (
                    <div className="absolute right-0 top-0 bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5">
                      {episodeCount} eps
                    </div>
                  )}
                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary/0 group-hover:bg-primary rounded-none flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-2">
                  <p className="line-clamp-1 text-xs font-bold group-hover:text-primary transition-colors">
                    {anime.animeTitle}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {anime.latestEpisode.episodeTitle?.split(" - ")[0] || anime.latestEpisode.episodeTitle}
                  </p>
                </div>

              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
