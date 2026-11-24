"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useReadHistory } from "@/lib/useReadHistory";

// Daftar chapter: chapter yang sudah dibaca diberi tanda ✓
export default function ChapterList({ chapters, mangaSlug }) {
  const { history } = useReadHistory();
  const read = useMemo(
    () => new Set(history.filter((h) => h.mangaSlug === mangaSlug).map((h) => h.chapterSlug)),
    [history, mangaSlug]
  );

  if (chapters.length === 0) {
    return <p className="border border-border bg-card p-4 text-xs text-muted-foreground">Belum ada chapter.</p>;
  }

  return (
    <div className="border border-border bg-card max-h-[520px] overflow-y-auto divide-y divide-border/50">
      {chapters.map((c) => {
        const isRead = read.has(c.slug);
        return (
          <Link
            key={c.slug}
            href={`/manga/read/${c.slug}`}
            className={`flex items-center justify-between gap-3 px-4 py-2.5 text-xs hover:bg-primary hover:text-primary-foreground transition-colors ${
              isRead ? "text-muted-foreground" : ""
            }`}
          >
            <span className="font-bold">
              {isRead && <span className="mr-1.5 text-primary">✓</span>}
              {c.title}
            </span>
            <span className="opacity-70 shrink-0">{c.releaseTime}</span>
          </Link>
        );
      })}
    </div>
  );
}

// Tombol "Lanjut" di halaman detail — hanya muncul kalau pernah baca komik ini
export function ResumeButton({ mangaSlug }) {
  const { grouped } = useReadHistory();
  const g = grouped.find((x) => x.mangaSlug === mangaSlug);
  if (!g) return null;
  return (
    <Link
      href={`/manga/read/${g.latest.chapterSlug}`}
      className="bg-primary text-primary-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors glow-hover"
    >
      Lanjut: {g.latest.chapterLabel}
    </Link>
  );
}
