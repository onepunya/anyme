"use client";

import { useWatchHistory } from "@/lib/useWatchHistory";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function ContinueWatching() {
  const { getGroupedHistory } = useWatchHistory();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const groupedHistory = getGroupedHistory();
  
  if (groupedHistory.length === 0) {
    return null;
  }

  const recentAnime = groupedHistory.slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Continue Watching</h2>
          <p className="text-sm text-muted-foreground">
            Pick up where you left off
          </p>
        </div>
        <Link
          href="/history"
          className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {recentAnime.map((anime) => {
          const episodeId = anime.latestEpisode.episodeId;
          const episodeCount = anime.episodes.length;
          
          return (
          <Link
            key={anime.animeId}
            href={`/episode/${episodeId}`}
            className="group"
          >
            <div className="overflow-hidden rounded-lg border transition-all hover:shadow-lg">
              <div className="relative aspect-video">
                <Image
                  src={anime.poster}
                  alt={anime.animeTitle}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                  className="object-cover transition-transform group-hover:scale-105"
                />
                {episodeCount > 1 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute right-2 top-2 bg-black/70 text-white hover:bg-black/70"
                  >
                    {episodeCount} eps
                  </Badge>
                )}
              </div>
              <div className="p-3 space-y-1">
                <p className="line-clamp-1 text-sm font-medium">
                  {anime.animeTitle}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  Continue: {anime.latestEpisode.episodeTitle?.split(" - ")[0] || anime.latestEpisode.episodeTitle}
                </p>
              </div>
            </div>
          </Link>
          );
        })}
      </div>
    </div>
  );
}
