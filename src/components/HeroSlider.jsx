"use client";

import { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

export default function HeroSlider({ animeList }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false })
  ]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {animeList.map((anime) => (
            <div key={anime.animeId} className="relative min-w-0 flex-[0_0_100%]">
              <div className="relative w-full min-h-[450px] md:min-h-[550px] lg:min-h-[600px] overflow-hidden bg-background">
                {/* Backdrop Layer - Blurred Background */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={anime.poster}
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover scale-125 blur opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-background/70" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                </div>

                {/* Content Layer */}
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10 lg:gap-12 p-6 md:p-10 lg:p-12 h-full">
                  {/* Poster - Sharp & Natural Size */}
                  <Link 
                    href={`/anime/${anime.animeId}`}
                    className="group relative flex-shrink-0"
                  >
                    <div className="relative w-60 md:w-72 lg:w-80 xl:w-96 aspect-[2/3] overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10">
                      <Image
                        src={anime.poster}
                        alt={anime.title}
                        fill
                        priority
                        sizes="(max-width: 768px) 240px, (max-width: 1024px) 288px, 384px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {anime.rank && (
                        <div className="absolute left-4 top-4 z-10">
                          <Badge variant="default" className="text-base md:text-lg font-bold px-3 py-1.5 md:px-4 md:py-2 shadow-xl">
                            #{anime.rank}
                          </Badge>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="rounded-full bg-primary/90 p-4 md:p-5 backdrop-blur-sm">
                          <Play className="h-6 w-6 md:h-8 md:w-8 fill-current" />
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Info Section */}
                  <div className="flex-1 flex flex-col justify-center space-y-4 md:space-y-6 max-w-2xl text-center md:text-left">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 justify-center md:justify-start">
                        <Badge variant="secondary" className="text-xs font-semibold">
                          Featured Anime
                        </Badge>
                        {anime.rank && (
                          <span className="text-xs text-muted-foreground font-medium">
                            Top #{anime.rank}
                          </span>
                        )}
                      </div>
                      
                      <Link href={`/anime/${anime.animeId}`}>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight hover:text-primary transition-colors line-clamp-2">
                          {anime.title}
                        </h1>
                      </Link>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 md:gap-4 justify-center md:justify-start">
                      {anime.score && (
                        <Badge variant="outline" className="font-mono text-sm md:text-base">
                          ⭐ {anime.score}
                        </Badge>
                      )}
                      {anime.episodes && (
                        <span className="text-sm md:text-base text-muted-foreground font-medium">
                          {anime.episodes} Episodes
                        </span>
                      )}
                    </div>

                    {anime.synopsis && (
                      <p className="text-sm md:text-base lg:text-lg text-muted-foreground line-clamp-3 md:line-clamp-4 leading-relaxed">
                        {anime.synopsis}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
                      <Link
                        href={`/anime/${anime.animeId}`}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
                      >
                        <Play className="h-4 w-4 fill-current" />
                        Watch Now
                      </Link>
                      <Link
                        href={`/anime/${anime.animeId}`}
                        className="inline-flex items-center justify-center rounded-lg border border-input bg-background/50 backdrop-blur-sm px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base font-semibold transition-all hover:bg-accent hover:text-accent-foreground"
                      >
                        More Info
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={scrollPrev}
        className="absolute left-2 md:left-4 lg:left-6 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2.5 md:p-3 backdrop-blur-md transition-all hover:bg-background hover:scale-110 shadow-xl border border-white/10 z-20"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      <button
        onClick={scrollNext}
        className="absolute right-2 md:right-4 lg:right-6 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2.5 md:p-3 backdrop-blur-md transition-all hover:bg-background hover:scale-110 shadow-xl border border-white/10 z-20"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
      </button>
    </div>
  );
}
