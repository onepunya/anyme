"use client";

import Link from "next/link";
import { useReadHistory } from "@/lib/useReadHistory";

export default function ContinueReading() {
  const { grouped, ready } = useReadHistory();
  if (!ready || grouped.length === 0) return null;

  return (
    <section className="fade-up">
      <div className="flex items-center justify-between mb-4">
        <div className="industrial-border">
          <h2 className="text-xl font-bold tracking-tight uppercase">Lanjut Baca</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Teruskan chapter terakhirmu</p>
        </div>
        <Link
          href="/history?tab=manga"
          className="text-xs font-semibold uppercase tracking-widest px-3 py-2 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          Riwayat
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {grouped.slice(0, 6).map((g) => (
          <Link key={g.mangaSlug} href={`/manga/read/${g.latest.chapterSlug}`} className="group block">
            <div className="border border-border bg-card hover:border-primary card-pop">
              <div className="relative aspect-[2/3] overflow-hidden bg-muted">
                {g.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={g.image}
                    alt={g.mangaTitle}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-2 text-center text-xs text-muted-foreground">
                    {g.mangaTitle}
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 to-transparent px-2 py-1.5">
                  <span className="text-[11px] font-bold text-white">{g.latest.chapterLabel}</span>
                </div>
              </div>
              <div className="p-2">
                <p className="line-clamp-1 text-xs font-bold group-hover:text-primary transition-colors">{g.mangaTitle}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
