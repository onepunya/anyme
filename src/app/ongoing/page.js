import { getOngoingAnime } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";
import Link from "next/link";

export const metadata = {
  title: "Ongoing Anime - KaelNime",
  description: "Browse all currently airing anime series",
};

export default async function OngoingPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page) || 1;
  
  const ongoingAnime = await getOngoingAnime(page);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Ongoing Anime</h1>
        <p className="text-muted-foreground">
          All currently airing anime series - Page {page}
        </p>
      </div>

      {ongoingAnime.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">No ongoing anime found</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {ongoingAnime.map((anime) => (
              <AnimeCard key={anime.animeId} anime={anime} showRank={false} />
            ))}
          </div>

          <div className="flex justify-center gap-2">
            {page > 1 && (
              <Link
                href={`/ongoing?page=${page - 1}`}
                className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                ← Previous
              </Link>
            )}
            <span className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium">
              Page {page}
            </span>
            <Link
              href={`/ongoing?page=${page + 1}`}
              className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Next →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
