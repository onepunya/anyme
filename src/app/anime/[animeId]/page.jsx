import { getAnimeDetail } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export async function generateMetadata({ params }) {
  const { animeId } = await params;
  try {
    const response = await getAnimeDetail(animeId);
    const anime = response.data;
    return {
      title: `${anime.english || anime.title || 'Anime'} - KaelNime`,
      description: anime.synopsis?.paragraphs?.[0] || 'Watch anime online',
    };
  } catch (error) {
    return {
      title: 'Anime - KaelNime',
      description: 'Watch anime online',
    };
  }
}

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
                    {anime.synopsis.connections.map((connection, index) => (
                      <Link
                        key={index}
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

      {/* Download Batch Section */}
      {anime.batchList && anime.batchList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
              Download Batch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {anime.batchList.map((batch) => (
                <Link
                  key={batch.batchId}
                  href={`/batch/${batch.batchId}`}
                  className="flex items-center justify-between rounded-lg border border-input bg-background p-4 transition-colors hover:bg-accent hover:border-primary"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                      >
                        <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
                        <polyline points="14 2 14 8 20 8" />
                        <path d="M3 15h6" />
                        <path d="M6 12v6" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">{batch.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Download all episodes in one package
                      </p>
                    </div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-muted-foreground"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
