"use client";

import { useEffect, useState } from "react";
import AnimeCard from "@/components/AnimeCard";

export default function RecentUpdates({ initialRecentAnime }) {
    const [recentAnime, setRecentAnime] = useState(initialRecentAnime);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnimePosters = async () => {
            try {
                // Create a map to store unique anime by animeId
                const animeMap = new Map();

                // Fetch anime details for each unique anime to get the proper poster
                const uniqueAnimeIds = [...new Set(initialRecentAnime.map(anime => anime.animeId))];

                const animeDetailsPromises = uniqueAnimeIds.map(async (animeId) => {
                    try {
                        const response = await fetch(`/api/anime/${animeId}`);
                        const data = await response.json();
                        return {
                            animeId,
                            poster: data?.data?.poster || null
                        };
                    } catch (error) {
                        console.error(`Failed to fetch details for ${animeId}:`, error);
                        return { animeId, poster: null };
                    }
                });

                const animeDetails = await Promise.all(animeDetailsPromises);

                // Create a map of animeId to poster
                animeDetails.forEach(({ animeId, poster }) => {
                    if (poster) {
                        animeMap.set(animeId, poster);
                    }
                });

                // Update recent anime with proper posters
                const updatedRecentAnime = initialRecentAnime.map(anime => ({
                    ...anime,
                    poster: animeMap.get(anime.animeId) || anime.poster
                }));

                setRecentAnime(updatedRecentAnime);
            } catch (error) {
                console.error("Failed to fetch anime posters:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnimePosters();
    }, [initialRecentAnime]);

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">Recent Updates</h2>
                <p className="text-sm text-muted-foreground">
                    Latest anime episodes released
                </p>
            </div>
            <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 ${loading ? "opacity-70" : ""}`}>
                {recentAnime.slice(0, 12).map((anime) => (
                    <AnimeCard key={anime.animeId} anime={anime} showRank={false} />
                ))}
            </div>
        </div>
    );
}
