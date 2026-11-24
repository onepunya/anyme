import Link from "next/link";

export default function MangaCard({ manga }) {
  return (
    <Link href={`/manga/${manga.slug}`} className="group block h-full">
      <div className="h-full flex flex-col border border-border bg-card hover:border-primary card-pop fade-up">
        <div className="relative aspect-[2/3] overflow-hidden bg-muted">
          {manga.type && (
            <div className="absolute left-0 top-0 z-10 bg-primary text-primary-foreground text-[10px] font-black uppercase px-1.5 py-0.5">
              {manga.type}
            </div>
          )}
          {manga.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={manga.image}
              alt={manga.title}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-3 text-center">
              <p className="text-xs text-muted-foreground line-clamp-3">{manga.title}</p>
            </div>
          )}
          <div className="absolute inset-0 z-[5] flex items-center justify-center bg-black/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span className="bg-primary text-primary-foreground px-3 py-1.5 text-[11px] font-black uppercase tracking-widest shadow-lg">
              Baca
            </span>
          </div>
          {manga.score && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5">
              <span className="text-xs font-bold text-white">⭐ {manga.score}</span>
            </div>
          )}
        </div>
        <div className="p-2 flex flex-col flex-1">
          <h3 className="line-clamp-2 text-xs font-bold leading-tight mb-1 flex-1 group-hover:text-primary transition-colors">
            {manga.title}
          </h3>
          <div className="flex items-center justify-between gap-2 mt-1">
            {manga.chapter && <span className="text-xs text-muted-foreground truncate">{manga.chapter}</span>}
            {manga.time && <span className="text-[10px] text-muted-foreground shrink-0">{manga.time}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
