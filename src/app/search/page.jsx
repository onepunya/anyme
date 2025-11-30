import { searchAnime } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Search Results</h1>
        {query && (
          <p className="text-muted-foreground">
            Showing results for: <span className="font-semibold">&quot;{query}&quot;</span>
          </p>
        )}
      </div>

      {!query ? (
        <Card>
          <CardContent className="flex min-h-[400px] items-center justify-center p-8">
            <div className="text-center">
              <p className="text-lg text-muted-foreground">
                Enter a search query to find anime
              </p>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="flex min-h-[400px] items-center justify-center p-8">
            <div className="text-center">
              <p className="text-lg text-destructive">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : results.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[400px] items-center justify-center p-8">
            <div className="text-center">
              <p className="text-lg text-muted-foreground">
                No results found for &quot;{query}&quot;
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {results.map((anime) => (
            <AnimeCard key={anime.animeId} anime={anime} showRank={false} />
          ))}
        </div>
      )}
    </div>
  );
}
