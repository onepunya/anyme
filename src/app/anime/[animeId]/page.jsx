export const dynamic = 'force-dynamic';

import { getAnimeDetail } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";

export async function generateMetadata({ params }) {
  const { animeId } = await params;
  try {
    const response = await getAnimeDetail(animeId);
    const anime = response.data;
    return {
      title: `${anime.english || anime.title || 'Anime'} - Anyme`,
      description: anime.synopsis?.paragraphs?.[0] || 'Watch anime online',
    };
  } catch (error) {
    return {
      title: 'Anime - Anyme',
      description: 'Watch anime online',
    };
  }
}

export default async function AnimeDetailPage({ params }) {
  const { animeId } = await params;
  const response = await getAnimeDetail(animeId);
  const anime = response.data;

  return (
    <div className="space-y-8 pb-10">

      {/* Hero Section */}
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">

        {/* Poster */}
        <div className="relative w-[160px] h-[240px] mx-auto md:mx-0 md:w-full md:h-[320px] overflow-hidden border-2 border-border">
          <Image
            src={anime.poster}
            alt={anime.title}
            fill
            className="object-cover"
            priority
          />
          {/* Industrial overlay corner */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div className="industrial-border">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight uppercase">
              {anime.english || anime.title}
            </h1>
            {anime.japanese && (
              <p className="text-sm text-muted-foreground mt-1">{anime.japanese}</p>
            )}
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2">
            {anime.genreList?.map((genre) => (
              <Link
                key={genre.genreId}
                href={`/genres/${genre.genreId}`}
                className="text-xs uppercase tracking-wider px-2 py-1 border border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {genre.title}
              </Link>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {anime.score?.value && (
              <div className="bg-card border border-border p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Score</p>
                <p className="font-bold text-primary mt-1">⭐ {anime.score.value}</p>
              </div>
            )}
            {anime.status && (
              <div className="bg-card border border-border p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                <p className="font-bold mt-1">{anime.status}</p>
              </div>
            )}
            {anime.type && (
              <div className="bg-card border border-border p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Type</p>
                <p className="font-bold mt-1">{anime.type}</p>
              </div>
            )}
            {anime.episodes && (
              <div className="bg-card border border-border p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Episodes</p>
                <p className="font-bold mt-1">{anime.episodes}</p>
              </div>
            )}
            {anime.season && (
              <div className="bg-card border border-border p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Season</p>
                <p className="font-bold mt-1">{anime.season}</p>
              </div>
            )}
            {anime.studios && (
              <div className="bg-card border border-border p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Studio</p>
                <p className="font-bold mt-1">{anime.studios}</p>
              </div>
            )}
          </div>

          {/* Synopsis */}
          {anime.synopsis?.paragraphs && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-2">
                Synopsis
              </h2>
              <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                {anime.synopsis.paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              {anime.synopsis.connections?.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-2">Related Anime</h3>
                  <div className="flex flex-wrap gap-2">
                    {anime.synopsis.connections.map((connection, index) => (
                      <Link
                        key={index}
                        href={`/anime/${connection.animeId}`}
                        className="text-xs px-3 py-1.5 border border-border hover:border-primary hover:text-primary transition-colors"
                      >
                        {connection.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Batch Download */}
      {anime.batchList?.length > 0 && (
        <div>
          <div className="industrial-border mb-4">
            <h2 className="text-lg font-bold uppercase tracking-tight">Download Batch</h2>
          </div>
          <div className="space-y-2">
            {anime.batchList.map((batch) => (
              <Link
                key={batch.batchId}
                href={`/batch/${batch.batchId}`}
                className="flex items-center justify-between border border-border bg-card p-4 hover:border-primary hover:bg-primary/5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 border border-primary/30 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" x2="12" y1="15" y2="3" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{batch.title}</p>
                    <p className="text-xs text-muted-foreground">Download all episodes</p>
                  </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground group-hover:text-primary transition-colors">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Episode List */}
      {anime.episodeList?.length > 0 && (
        <div>
          <div className="industrial-border mb-4">
            <h2 className="text-lg font-bold uppercase tracking-tight">Episodes</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{anime.episodeList.length} episodes available</p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9">
            {anime.episodeList.map((episode) => (
              <Link
                key={episode.episodeId}
                href={`/episode/${episode.episodeId}`}
                className="flex items-center justify-center border border-border bg-card py-3 text-xs font-bold hover:border-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {episode.title}
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
