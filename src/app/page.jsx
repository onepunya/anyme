import { getTopAnime, getOngoingAnime, getRecentAnime } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";
import Link from "next/link";
import ContinueWatching from "@/components/ContinueWatching";

export default async function Home() {
  const [recentAnime, ongoingAnime, topAnime] = await Promise.all([
    getRecentAnime(),
    getOngoingAnime(),
    getTopAnime()
  ]);

  return (
    <div className="space-y-12">      
      <ContinueWatching />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Ongoing Anime</h2>
            <p className="text-sm text-muted-foreground">
              Currently airing anime series
            </p>
          </div>
          <Link
            href="/ongoing"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {ongoingAnime.slice(0, 12).map((anime) => (
            <AnimeCard key={anime.animeId} anime={anime} showRank={false} />
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Recent Updates</h2>
          <p className="text-sm text-muted-foreground">
            Latest anime episodes released
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {recentAnime.slice(0, 12).map((anime) => (
            <AnimeCard key={anime.animeId} anime={anime} showRank={false}  />
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Top 10 Anime</h2>
          <p className="text-sm text-muted-foreground">
            Most popular anime right now
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {topAnime.map((anime) => (
            <AnimeCard key={anime.animeId} anime={anime} showRank={true} />
          ))}
        </div>
      </div>
    </div>
  );
}
