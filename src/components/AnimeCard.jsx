
import Link from "next/link";
import Image from "next/image";

export default function AnimeCard({ anime, showRank = false }) {
  const hasPoster = anime.poster && anime.poster.trim() !== "";

  return (
    <Link href={`/anime/${anime.animeId}`} className="group block h-full">
      <div className="h-full flex flex-col border border-border bg-card hover:border-primary transition-colors duration-200">
        
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden bg-muted">
          
          {/* Rank Badge */}
          {showRank && anime.rank && (
            <div className="absolute left-0 top-0 z-10 w-8 h-8 bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">
              {anime.rank}
            </div>
          )}

          {hasPoster ? (
            <Image
              src={anime.poster}
              alt={anime.title}
              fill
              sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-card">
              <div className="text-center p-3">
                <div className="text-3xl mb-1">🎬</div>
                <p className="text-xs text-muted-foreground line-clamp-2">{anime.title}</p>
              </div>
            </div>
          )}

          {/* Score overlay */}
          {anime.score && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5">
              <span className="text-xs font-bold text-white">⭐ {anime.score}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-2 flex flex-col flex-1">
          <h3 className="line-clamp-2 text-xs font-bold leading-tight mb-1 flex-1 group-hover:text-primary transition-colors">
            {anime.title}
          </h3>
          <div className="flex items-center justify-between mt-1">
            {anime.episodes && (
              <span className="text-xs text-muted-foreground">Ep {anime.episodes}</span>
            )}
            {anime.releasedOn && (
              <span className="text-xs text-muted-foreground">{anime.releasedOn}</span>
            )}
          </div>
        </div>

      </div>
    </Link>
  );
}