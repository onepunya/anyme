"use client";

import { useEffect } from "react";
import { addReadEntry, getMangaMeta, setMangaMeta } from "@/lib/useReadHistory";

// Dipasang di halaman reader: mencatat chapter yang sedang dibaca
export default function ReadTracker({ chapterSlug, chapterTitle, mangaSlug }) {
  useEffect(() => {
    if (!chapterSlug || !mangaSlug) return;
    let cancelled = false;

    const label = (chapterTitle.match(/chapter\s*([\d.]+\w*)/i) || [])[1];
    const guessedTitle = chapterTitle.replace(/\s*chapter\s*[\d.]+.*$/i, "").trim();
    const base = {
      chapterSlug,
      chapterTitle,
      chapterLabel: label ? `Chapter ${label}` : chapterTitle,
      mangaSlug,
    };

    const meta = getMangaMeta(mangaSlug);
    addReadEntry({ ...base, mangaTitle: meta?.title || guessedTitle, image: meta?.image || "" });

    // belum punya cover? ambil sekali dari server lalu perbarui entri
    if (!meta?.image) {
      fetch(`/api/manga-meta?slug=${encodeURIComponent(mangaSlug)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((m) => {
          if (cancelled || !m?.image) return;
          setMangaMeta(mangaSlug, m);
          addReadEntry({ ...base, mangaTitle: m.title || guessedTitle, image: m.image });
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [chapterSlug, chapterTitle, mangaSlug]);

  return null;
}

// Dipasang di halaman detail: simpan judul + cover supaya riwayat punya gambar
export function MangaVisit({ slug, title, image }) {
  useEffect(() => {
    if (slug && image) setMangaMeta(slug, { title, image });
  }, [slug, title, image]);
  return null;
}
