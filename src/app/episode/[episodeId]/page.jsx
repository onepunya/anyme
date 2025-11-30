import { getEpisodeDetail } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import VideoPlayer from "@/components/VideoPlayer";

export async function generateMetadata({ params }) {
  const { episodeId } = await params;
  try {
    const response = await getEpisodeDetail(episodeId);
    const episode = response.data;
    return {
      title: `${episode.title || 'Episode'} - KaelNime`,
      description: episode.synopsis?.paragraphs?.[0] || 'Watch anime episode online',
    };
  } catch (error) {
    return {
      title: 'Episode - KaelNime',
      description: 'Watch anime episode online',
    };
  }
}

export default async function EpisodePage({ params }) {
  const { episodeId } = await params;
  const response = await getEpisodeDetail(episodeId);
  const episode = response.data;

  return (
    <div className="space-y-8">
      

      <VideoPlayer episodeData={episode} episodeId={episodeId} />

      {episode.synopsis?.paragraphs && episode.synopsis.paragraphs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Synopsis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-muted-foreground">
              {episode.synopsis.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            {episode.synopsis.connections && episode.synopsis.connections.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Related Anime:</h3>
                <div className="flex flex-wrap gap-2">
                  {episode.synopsis.connections.map((connection, index) => (
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
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
        <div className="relative h-[280px] w-[200px] shrink-0 mx-auto md:mx-0 overflow-hidden rounded-lg border">
          <Image
            src={episode.poster}
            alt={episode.title}
            fill
            sizes="200px"
            className="object-cover"
            priority
          />
        </div>
        <div className="flex-1 space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{episode.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link
              href={`/anime/${episode.animeId}`}
              className="hover:text-foreground hover:underline"
            >
              Back to Anime Details
            </Link>
            {episode.releasedOn && <span>• {episode.releasedOn}</span>}
          </div>
          {episode.genreList && episode.genreList.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {episode.genreList.map((genre) => (
                <Badge key={genre.genreId} variant="outline">
                  {genre.title}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {episode.downloadUrl?.formats && episode.downloadUrl.formats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Download Links</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion defaultValue="mkv">
              {episode.downloadUrl.formats.map((format, formatIndex) => (
                <AccordionItem key={formatIndex} value={format.title.toLowerCase().replace(/\s/g, '-')}>
                  <AccordionTrigger value={format.title.toLowerCase().replace(/\s/g, '-')}>
                    <span className="text-base font-semibold">{format.title}</span>
                  </AccordionTrigger>
                  <AccordionContent value={format.title.toLowerCase().replace(/\s/g, '-')}>
                    <div className="space-y-4 pt-4">
                      {format.qualities?.map((quality, qualityIndex) => (
                        <div key={qualityIndex}>
                          <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                            {quality.title}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {quality.urls?.map((urlData, urlIndex) => (
                              <a
                                key={urlIndex}
                                href={urlData.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                              >
                                {urlData.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {episode.recommendedEpisodeList && episode.recommendedEpisodeList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Other Episodes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {episode.recommendedEpisodeList.slice(0, 8).map((recEpisode, index) => (
                <Link
                  key={`${recEpisode.episodeId}-${index}`}
                  href={`/episode/${recEpisode.episodeId}`}
                  className="group"
                >
                  <div className="overflow-hidden rounded-lg border transition-all hover:shadow-lg">
                    <div className="relative aspect-video">
                      <Image
                        src={recEpisode.poster}
                        alt={recEpisode.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="p-2">
                      <p className="line-clamp-2 text-xs font-medium">
                        {recEpisode.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {recEpisode.releaseDate}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {episode.movie?.animeList && episode.movie.animeList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommended Movies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {episode.movie.animeList.slice(0, 5).map((movie) => (
                <Link
                  key={movie.animeId}
                  href={`/anime/${movie.animeId}`}
                  className="group"
                >
                  <div className="overflow-hidden rounded-lg border transition-all hover:shadow-lg">
                    <div className="relative aspect-[2/3]">
                      <Image
                        src={movie.poster}
                        alt={movie.title}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="p-3">
                      <p className="line-clamp-2 text-sm font-medium mb-1">
                        {movie.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {movie.releaseDate}
                      </p>
                      {movie.genreList && movie.genreList.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {movie.genreList.slice(0, 2).map((genre) => (
                            <Badge key={genre.genreId} variant="outline" className="text-xs">
                              {genre.title}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
