import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AnimeCard({ anime, showRank = false }) {
  const hasPoster = anime.poster && anime.poster.trim() !== "";

  return (
    <Link href={`/anime/${anime.animeId}`} className="h-full">
      <Card className="group h-full flex flex-col overflow-hidden transition-all hover:shadow-lg">
        <div className="relative aspect-[2/3] overflow-hidden bg-muted">
          {showRank && anime.rank && (
            <div className="absolute left-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              {anime.rank}
            </div>
          )}
          {hasPoster ? (
            <Image
              src={anime.poster}
              alt={anime.title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/20">
              <div className="text-center p-4">
                <div className="text-4xl mb-2">🎬</div>
                <p className="text-xs text-muted-foreground font-medium line-clamp-2">
                  {anime.title}
                </p>
              </div>
            </div>
          )}
        </div>
        <CardContent className="flex flex-col flex-1 p-4">
          <h3 className="line-clamp-2 font-semibold text-sm leading-tight mb-2 flex-1">
            {anime.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
            {anime.score && (
              <Badge variant="outline" className="font-mono">
                ⭐ {anime.score}
              </Badge>
            )}
            {anime.episodes && (
              <span className="text-xs">Ep {anime.episodes}</span>
            )}
            {anime.releasedOn && (
              <span className="text-xs">{anime.releasedOn}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
