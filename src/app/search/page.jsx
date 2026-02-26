export const dynamic = 'force-dynamic';

import { searchAnime } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";
import SearchInput from "@/components/SearchInput";

export default async function SearchPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";

  let results = [];
  let error = null;

  if (query) {
    try {
      const response = await searchAnime(query);
      results = response.data?.animeList || [];
    } catch (err) {
      error = "Failed to search anime";
    }
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="industrial-border">
        <h1 className="text-2xl font-bold uppercase tracking-tight">Search</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Find your favorite anime</p>
      </div>

      {/* Search Input */}
      <SearchInput defaultValue={query} />

      {/* Results */}
      {!query ? (
        <div className="flex min-h-[300px] items-center justify-center border border-border">
          <div className="text-center space-y-2">
            <p className="text-4xl">🔍</p>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">
              Enter a search query to find anime
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="flex min-h-[300px] items-center justify-center border border-border">
          <p className="text-sm text-destructive uppercase tracking-wider">{error}</p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center border border-border">
          <div className="text-center space-y-2">
            <p className="text-4xl">😢</p>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">
              No results for &quot;{query}&quot;
            </p>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
            {results.length} results for &quot;{query}&quot;
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {results.map((anime) => (
              <AnimeCard key={anime.animeId} anime={anime} showRank={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
