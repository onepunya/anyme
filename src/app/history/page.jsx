"use client";

import { useWatchHistory } from "@/lib/useWatchHistory";
import Image from "next/image";
import Link from "next/link";
import { Trash2, History, ChevronDown, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

function formatTimeAgo(timestamp) {
  const now = Date.now();
  const seconds = Math.floor((now - timestamp) / 1000);
  
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function HistoryPage() {
  const { getGroupedHistory, removeFromHistory, removeAnimeHistory, clearHistory } = useWatchHistory();
  const [expandedAnime, setExpandedAnime] = useState({});
  
  const groupedHistory = getGroupedHistory();

  const toggleAnime = (animeId) => {
    setExpandedAnime(prev => ({
      ...prev,
      [animeId]: !prev[animeId]
    }));
  };

  if (groupedHistory.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <History className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">No Watch History</h2>
        <p className="text-muted-foreground">
          Start watching anime to see your history here
        </p>
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Browse Anime
        </Link>
      </div>
    );
  }

  const totalEpisodes = groupedHistory.reduce((sum, anime) => sum + anime.episodes.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Watch History</h1>
          <p className="text-muted-foreground">
            {groupedHistory.length} {groupedHistory.length === 1 ? "anime" : "anime"} • {totalEpisodes} {totalEpisodes === 1 ? "episode" : "episodes"}
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            if (confirm("Are you sure you want to clear all watch history?")) {
              clearHistory();
            }
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear All
        </Button>
      </div>

      <div className="space-y-3">
        {groupedHistory.map((anime) => {
          const isExpanded = expandedAnime[anime.animeId];
          const episodeCount = anime.episodes.length;
          
          return (
            <div key={anime.animeId} className="rounded-lg border bg-card">
              {/* Anime Header - Always Visible */}
              <div className="flex gap-4 p-4">
                {/* Anime Poster */}
                <Link 
                  href={`/anime/${anime.animeId}`}
                  className="relative h-32 w-24 shrink-0 overflow-hidden rounded-md"
                >
                  <Image
                    src={anime.poster}
                    alt={anime.animeTitle}
                    fill
                    sizes="96px"
                    className="object-cover transition-transform hover:scale-105"
                  />
                </Link>

                {/* Anime Info */}
                <div className="flex flex-1 flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <Link 
                        href={`/anime/${anime.animeId}`}
                        className="hover:underline"
                      >
                        <h3 className="text-lg font-semibold leading-tight">
                          {anime.animeTitle}
                        </h3>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Remove all episodes of ${anime.animeTitle} from history?`)) {
                            removeAnimeHistory(anime.animeId);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span>{formatTimeAgo(anime.lastWatchedAt)}</span>
                      <span>•</span>
                      <Badge variant="secondary">{episodeCount} {episodeCount === 1 ? "episode" : "episodes"}</Badge>
                    </div>

                    {/* Continue Watching Button */}
                    <Link href={`/episode/${anime.latestEpisode.episodeId}`}>
                      <Button variant="default" size="sm" className="mt-1">
                        <Play className="mr-2 h-4 w-4" />
                        Continue: {anime.latestEpisode.episodeTitle?.split(" Episode ")[1]?.split(" Sub")[0] || "Latest Episode"}
                      </Button>
                    </Link>
                  </div>

                  {/* Expand/Collapse Button */}
                  {episodeCount > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAnime(anime.animeId)}
                      className="mt-2 w-full justify-between"
                    >
                      <span className="text-xs">
                        {isExpanded ? "Hide" : "Show"} all episodes
                      </span>
                      <ChevronDown 
                        className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </Button>
                  )}
                </div>
              </div>

              {/* Episode List - Expandable */}
              {isExpanded && episodeCount > 1 && (
                <div className="border-t bg-muted/30 px-4 py-3">
                  <div className="space-y-2">
                    {anime.episodes.map((episode) => (
                      <div
                        key={episode.episodeId}
                        className="flex items-center justify-between rounded-md bg-background p-3 text-sm"
                      >
                        <Link 
                          href={`/episode/${episode.episodeId}`}
                          className="flex-1 hover:underline"
                        >
                          <div className="flex items-center gap-3">
                            <Play className="h-3 w-3 shrink-0 text-muted-foreground" />
                            <span className="line-clamp-1 font-medium">
                              {episode.episodeTitle}
                            </span>
                          </div>
                        </Link>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(episode.watchedAt)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              if (confirm("Remove this episode from history?")) {
                                removeFromHistory(episode.episodeId);
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
