"use client";

import { useState } from "react";
import Link from "next/link";
import { useReadHistory, timeAgoId } from "@/lib/useReadHistory";

function Cover({ src, title, className = "" }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={title} loading="lazy" referrerPolicy="no-referrer" className={`object-cover ${className}`} />
  ) : (
    <div className={`flex items-center justify-center bg-muted text-xl font-black text-primary ${className}`}>
      {String(title).charAt(0).toUpperCase()}
    </div>
  );
}

export default function MangaHistory() {
  const { grouped, ready, removeChapter, removeManga, clear } = useReadHistory();
  const [open, setOpen] = useState({});

  if (!ready) return null;

  if (grouped.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center space-y-3 text-center">
        <p className="text-5xl">📖</p>
        <h2 className="text-xl font-bold uppercase tracking-tight">Belum ada riwayat baca</h2>
        <p className="text-sm text-muted-foreground">Chapter yang kamu baca akan muncul di sini.</p>
        <Link
          href="/manga"
          className="bg-primary text-primary-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors"
        >
          Jelajahi Manga
        </Link>
      </div>
    );
  }

  const totalChapters = grouped.reduce((n, g) => n + g.chapters.length, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="industrial-border">
          <h1 className="text-2xl font-bold uppercase tracking-tight">Riwayat Baca</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {grouped.length} komik · {totalChapters} chapter
          </p>
        </div>
        <button
          onClick={() => confirm("Hapus semua riwayat baca?") && clear()}
          className="border border-red-500/60 text-red-500 px-3 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors"
        >
          Hapus Semua
        </button>
      </div>

      <div className="space-y-3">
        {grouped.map((g) => {
          const expanded = open[g.mangaSlug];
          return (
            <div key={g.mangaSlug} className="border border-border bg-card">
              <div className="flex gap-4 p-3 sm:p-4">
                <Link href={`/manga/${g.mangaSlug}`} className="shrink-0">
                  <Cover src={g.image} title={g.mangaTitle} className="h-28 w-20 border border-border" />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/manga/${g.mangaSlug}`} className="hover:text-primary transition-colors">
                        <h3 className="line-clamp-2 text-sm font-bold leading-tight">{g.mangaTitle}</h3>
                      </Link>
                      <button
                        onClick={() => confirm(`Hapus riwayat ${g.mangaTitle}?`) && removeManga(g.mangaSlug)}
                        className="shrink-0 text-xs text-muted-foreground hover:text-red-500 transition-colors"
                        aria-label="Hapus riwayat komik ini"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {timeAgoId(g.lastReadAt)} · {g.chapters.length} chapter dibaca
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/manga/read/${g.latest.chapterSlug}`}
                      className="bg-primary text-primary-foreground px-3 py-2 text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors"
                    >
                      Lanjut: {g.latest.chapterLabel}
                    </Link>
                    {g.chapters.length > 1 && (
                      <button
                        onClick={() => setOpen((o) => ({ ...o, [g.mangaSlug]: !o[g.mangaSlug] }))}
                        className="border border-border px-3 py-2 text-xs uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
                      >
                        {expanded ? "Sembunyikan" : "Semua chapter"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {expanded && (
                <div className="border-t border-border divide-y divide-border/50 max-h-72 overflow-y-auto">
                  {g.chapters.map((c) => (
                    <div key={c.chapterSlug} className="flex items-center justify-between gap-3 px-4 py-2 text-xs">
                      <Link href={`/manga/read/${c.chapterSlug}`} className="flex-1 font-bold hover:text-primary transition-colors">
                        {c.chapterLabel}
                      </Link>
                      <span className="text-muted-foreground">{timeAgoId(c.readAt)}</span>
                      <button
                        onClick={() => removeChapter(c.chapterSlug)}
                        className="text-muted-foreground hover:text-red-500 transition-colors"
                        aria-label="Hapus chapter dari riwayat"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
