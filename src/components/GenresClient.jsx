"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

export default function GenresClient({ genres }) {
    const [genrePosters, setGenrePosters] = useState({});

    useEffect(() => {
        // Fetch first anime poster for each genre
        const fetchGenrePosters = async () => {
            const posters = {};
            const usedPosters = new Set(); // Track used poster URLs

            await Promise.all(
                genres.map(async (genre) => {
                    try {
                        const response = await fetch(`/api/genres/${genre.genreId}?page=1`);
                        const data = await response.json();
                        const animeList = data?.data?.animeList || [];

                        // Try to find an anime with a unique poster
                        let selectedPoster = null;
                        for (const anime of animeList.slice(0, 5)) { // Check first 5 anime
                            if (anime?.poster && !usedPosters.has(anime.poster)) {
                                selectedPoster = anime.poster;
                                usedPosters.add(anime.poster);
                                break;
                            }
                        }

                        // If all posters are used, just use the first one
                        if (!selectedPoster && animeList[0]?.poster) {
                            selectedPoster = animeList[0].poster;
                        }

                        if (selectedPoster) {
                            posters[genre.genreId] = selectedPoster;
                        }
                    } catch (error) {
                        console.error(`Failed to fetch poster for ${genre.genreId}:`, error);
                    }
                })
            );

            setGenrePosters(posters);
        };

        fetchGenrePosters();
    }, [genres]);

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Browse by Genre</h1>
                <p className="text-muted-foreground">
                    Explore anime by your favorite genres
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {genres.map((genre) => (
                    <Link key={genre.genreId} href={`/genres/${genre.genreId}`}>
                        <Card className="group h-full overflow-hidden transition-all hover:shadow-lg hover:border-primary">
                            <CardContent className="relative flex h-32 items-center justify-center p-0">
                                {/* Background Image with Overlay */}
                                {genrePosters[genre.genreId] ? (
                                    <>
                                        <div className="absolute inset-0">
                                            <Image
                                                src={genrePosters[genre.genreId]}
                                                alt={genre.title}
                                                fill
                                                className="object-cover transition-transform group-hover:scale-110"
                                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                                            />
                                        </div>
                                        {/* Dark Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 transition-opacity group-hover:from-black/70 group-hover:via-black/40 group-hover:to-black/20" />
                                    </>
                                ) : (
                                    // Fallback gradient background
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
                                )}

                                {/* Genre Title */}
                                <h3 className="relative z-10 text-center font-bold text-lg text-white drop-shadow-lg transition-transform group-hover:scale-110">
                                    {genre.title}
                                </h3>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
