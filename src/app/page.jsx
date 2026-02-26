
export const dynamic = 'force-dynamic';

import { getTopAnime, getOngoingAnime, getRecentAnime } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";
import Link from "next/link";
import ContinueWatching from "@/components/ContinueWatching";

export default async function Home() {
  const [recentData, ongoingData, topAnime] = await Promise.all([
    getRecentAnime(),
    getOngoingAnime(),
    getTopAnime()
  ]);

  const recentAnime = recentData?.data?.animeList || [];
  const ongoingAnime = ongoingData?.data?.animeList || [];

  return (
    <div className="space-y-10 pb-10">
      <ContinueWatching />

      {/* Ongoing Anime */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="industrial-border">
            <h2 className="text-xl font-bold tracking-tight uppercase">Ongoing Anime</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Currently airing series</p>
          </div>
          <Link
            href="/ongoing"
            className="text-xs font-semibold uppercase tracking-widest px-3 py-2 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            View All
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {ongoingAnime.slice(0, 12).map((anime) => (
            <AnimeCard key={anime.animeId} anime={anime} showRank={false} />
          ))}
        </div>
      </section>

      {/* Recent Updates */}
      <section>
        <div className="industrial-border mb-4">
          <h2 className="text-xl font-bold tracking-tight uppercase">Recent Updates</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Latest episodes released</p>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {recentAnime.slice(0, 12).map((anime) => (
            <AnimeCard key={anime.animeId} anime={anime} showRank={false} />
          ))}
        </div>
      </section>

      {/* Top 10 */}
      <section>
        <div className="industrial-border mb-4">
          <h2 className="text-xl font-bold tracking-tight uppercase">Top 10 Anime</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Most popular right now</p>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5">
          {topAnime.map((anime) => (
            <AnimeCard key={anime.animeId} anime={anime} showRank={true} />
          ))}
        </div>
      </section>
    </div>
  );
}
