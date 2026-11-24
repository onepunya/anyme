"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

// Riwayat baca manga — disimpan di localStorage perangkat (terpisah dari history anime)
const KEY = "anyme_read_history";
const META = "anyme_manga_meta"; // cache judul + cover per manga
const MAX = 100;
const EVT = "anyme-read-history";

function read(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v ?? fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}
const notify = () => window.dispatchEvent(new Event(EVT));

// entry: { chapterSlug, chapterTitle, chapterLabel, mangaSlug, mangaTitle, image }
export function addReadEntry(entry) {
  if (!entry?.chapterSlug) return;
  const all = read(KEY, []);
  const rest = all.filter((x) => x.chapterSlug !== entry.chapterSlug);
  write(KEY, [{ ...entry, readAt: Date.now() }, ...rest].slice(0, MAX));
  notify();
}

export function getMangaMeta(slug) {
  return read(META, {})[slug] || null;
}

export function setMangaMeta(slug, meta) {
  if (!slug || !meta) return;
  const all = read(META, {});
  all[slug] = { title: meta.title, image: meta.image };
  const keys = Object.keys(all);
  if (keys.length > 200) delete all[keys[0]]; // batasi ukuran cache
  write(META, all);
}

export function timeAgoId(ts) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return "baru saja";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} hari lalu`;
  return `${Math.floor(d / 30)} bulan lalu`;
}

export function useReadHistory() {
  const [history, setHistory] = useState([]);
  const [ready, setReady] = useState(false);

  const load = useCallback(() => {
    setHistory(read(KEY, []));
    setReady(true);
  }, []);

  useEffect(() => {
    load();
    window.addEventListener(EVT, load);
    window.addEventListener("storage", load); // sinkron antar tab
    return () => {
      window.removeEventListener(EVT, load);
      window.removeEventListener("storage", load);
    };
  }, [load]);

  const removeChapter = useCallback((chapterSlug) => {
    write(KEY, read(KEY, []).filter((x) => x.chapterSlug !== chapterSlug));
    notify();
  }, []);

  const removeManga = useCallback((mangaSlug) => {
    write(KEY, read(KEY, []).filter((x) => x.mangaSlug !== mangaSlug));
    notify();
  }, []);

  const clear = useCallback(() => {
    write(KEY, []);
    notify();
  }, []);

  // dikelompokkan per manga, yang terakhir dibaca di atas
  const grouped = useMemo(() => {
    const map = new Map();
    for (const e of history) {
      // history sudah terurut terbaru -> entry pertama tiap manga = chapter terakhir dibaca
      const g = map.get(e.mangaSlug);
      if (!g) {
        map.set(e.mangaSlug, {
          mangaSlug: e.mangaSlug,
          mangaTitle: e.mangaTitle || e.mangaSlug,
          image: e.image || "",
          latest: e,
          lastReadAt: e.readAt,
          chapters: [e],
        });
      } else {
        g.chapters.push(e);
        if (!g.image && e.image) g.image = e.image;
      }
    }
    return [...map.values()].sort((a, b) => b.lastReadAt - a.lastReadAt);
  }, [history]);

  return { history, grouped, ready, removeChapter, removeManga, clear };
}
