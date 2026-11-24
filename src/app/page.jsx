
export const dynamic = 'force-dynamic';

import { getTopAnime, getOngoingAnime, getMovieAnime } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";
import Link from "next/link";
import ContinueWatching from "@/components/ContinueWatching";
import DownloadPopup from "@/components/DownloadPopup";
import HeroBanner from "@/components/HeroBanner";
import ContinueReading from "@/components/ContinueReading";
import MangaCard from "@/components/MangaCard";
import { getKomikLatest } from "@/lib/komik";

export default async function Home() {
  const [movieData, ongoingData, topAnime, komik] = await Promise.all([
    getMovieAnime(),
    getOngoingAnime(),
    getTopAnime(),
    getKomikLatest(1),
  ]);

  const movieAnime = movieData?.data?.animeList || [];
  const ongoingAnime = ongoingData?.data?.animeList || [];

  return (
    <div className="space-y-10 pb-10">
      <DownloadPopup />
      <HeroBanner items={ongoingAnime.slice(0, 5)} />
      <ContinueWatching />
      <ContinueReading />

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

      {/* Movies */}
      <section>
        <div className="industrial-border mb-4">
          <h2 className="text-xl font-bold tracking-tight uppercase">Anime Movies</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Latest anime films</p>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {movieAnime.slice(0, 12).map((anime) => (
            <AnimeCard key={anime.animeId} anime={anime} showRank={false} />
          ))}
        </div>
      </section>

      {/* Manga terbaru */}
      {komik.items.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="industrial-border">
              <h2 className="text-xl font-bold tracking-tight uppercase">Manga & Komik</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Update chapter terbaru</p>
            </div>
            <Link
              href="/manga"
              className="text-xs font-semibold uppercase tracking-widest px-3 py-2 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {komik.items.slice(0, 12).map((m, i) => (
              <MangaCard key={`${m.slug}-${i}`} manga={m} />
            ))}
          </div>
        </section>
      )}

      {/* Top 10 (hanya tampil kalau API menyediakan data populer) */}
      {topAnime.length > 0 && (
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
      )}
    </div>
  );
}
