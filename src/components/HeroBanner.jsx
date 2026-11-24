"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function HeroBanner({ items = [] }) {
  const slides = items.filter((a) => a?.poster);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length < 2 || paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length, paused]);

  if (slides.length === 0) return null;

  return (
    <section
      className="relative overflow-hidden border border-border bg-card h-[320px] md:h-[380px] fade-up"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((a, i) => (
        <div
          key={a.animeId}
          aria-hidden={i !== idx}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === idx ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Latar: poster diburamkan */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={a.poster}
            alt=""
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover scale-110 blur-2xl opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

          <div className="relative flex h-full items-center gap-5 md:gap-8 px-5 md:px-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={a.poster}
              alt={a.title}
              referrerPolicy="no-referrer"
              className="hidden sm:block h-[230px] md:h-[290px] aspect-[2/3] object-cover border-2 border-primary/60 shadow-2xl"
            />
            <div className="max-w-xl space-y-3">
              <span className="inline-block bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-2 py-1">
                Sedang Tayang
              </span>
              <h2 className="text-2xl md:text-4xl font-black uppercase leading-tight tracking-tight line-clamp-3">
                {a.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {a.score && <span className="font-bold text-primary">⭐ {a.score}</span>}
                {a.episodes && <span>Ep {a.episodes}</span>}
                {a.releasedOn && <span>{a.releasedOn}</span>}
              </div>
              <div className="flex gap-2 pt-1">
                <Link
                  href={`/anime/${a.animeId}`}
                  className="bg-primary text-primary-foreground px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors glow-hover"
                >
                  ▶ Tonton
                </Link>
                <Link
                  href="/ongoing"
                  className="border border-border bg-background/50 px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
                >
                  Semua Ongoing
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Indikator */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 right-4 flex gap-1.5">
          {slides.map((a, i) => (
            <button
              key={a.animeId}
              onClick={() => setIdx(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-1.5 transition-all ${i === idx ? "w-6 bg-primary" : "w-2 bg-foreground/30 hover:bg-foreground/60"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
