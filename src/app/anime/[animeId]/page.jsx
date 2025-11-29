import { getAnimeDetail } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AnimeDetailPage({ params }) {
  const { animeId } = await params;
  const response = await getAnimeDetail(animeId);
  const anime = response.data;

  return (
    <div className="space-y-8">
      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        <div className="relative md:h-[400] w-[200px] h-[280px] mx-auto md:mx-0 md:w-full overflow-hidden rounded-lg border">
          <Image
            src={anime.poster}
            alt={anime.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{anime.english}</h1>
            {anime.japanese && (
              <p className="text-lg text-muted-foreground">{anime.japanese}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {anime.genreList?.map((genre) => (
              <Badge key={genre.genreId} variant="outline">
                {genre.title}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {anime.score?.value && (
              <div>
                <span className="text-muted-foreground">Score:</span>{" "}
                <span className="font-semibold">⭐ {anime.score.value}</span>
              </div>
            )}
            {anime.status && (
              <div>
                <span className="text-muted-foreground">Status:</span>{" "}
                <span className="font-semibold">{anime.status}</span>
              </div>
            )}
            {anime.type && (
              <div>
                <span className="text-muted-foreground">Type:</span>{" "}
                <span className="font-semibold">{anime.type}</span>
              </div>
            )}
            {anime.episodes && (
              <div>
                <span className="text-muted-foreground">Episodes:</span>{" "}
                <span className="font-semibold">{anime.episodes}</span>
              </div>
            )}
            {anime.season && (
              <div>
                <span className="text-muted-foreground">Season:</span>{" "}
                <span className="font-semibold">{anime.season}</span>
              </div>
            )}
            {anime.studios && (
              <div>
                <span className="text-muted-foreground">Studio:</span>{" "}
                <span className="font-semibold">{anime.studios}</span>
              </div>
            )}
          </div>

          {anime.synopsis?.paragraphs && (
            <div>
              <h2 className="mb-2 text-xl font-semibold">Synopsis</h2>
              <div className="space-y-2 text-muted-foreground">
                {anime.synopsis.paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              {anime.synopsis.connections && anime.synopsis.connections.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h3 className="text-sm font-semibold">Related Anime:</h3>
                  <div className="flex flex-wrap gap-2">
                    {anime.synopsis.connections.map((connection) => (
                      <Link
                        key={connection.animeId}
                        href={`/anime/${connection.animeId}`}
                        className="inline-flex items-center rounded-md border border-input bg-background px-3 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
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

      {anime.episodeList && anime.episodeList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Episodes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {anime.episodeList.map((episode) => (
                <Link
                  key={episode.episodeId}
                  href={`/episode/${episode.episodeId}`}
                  className="inline-flex h-auto items-center justify-center rounded-md border border-input bg-background px-4 py-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Episode {episode.title}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
