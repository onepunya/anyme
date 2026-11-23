"use client";

import { useState } from "react";
import AnimeCard from "@/components/AnimeCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function OngoingClient({ initialData }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [animeData, setAnimeData] = useState(initialData);
    const [loading, setLoading] = useState(false);

    const animeList = animeData?.data?.animeList || [];
    const pagination = animeData?.pagination;

    const loadPage = async (page) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/ongoing?page=${page}`);
            const data = await response.json();
            setAnimeData(data);
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (error) {
            console.error("Failed to load page:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Ongoing Anime</h1>
                <p className="text-muted-foreground">
                    All currently airing anime series
                </p>
            </div>

            {animeList.length > 0 ? (
                <>
                    <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 ${loading ? "opacity-50" : ""}`}>
                        {animeList.map((anime) => (
                            <AnimeCard key={anime.animeId} anime={anime} showRank={false} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => loadPage(currentPage - 1)}
                                disabled={!pagination.hasPrevPage || loading}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Button>

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                    Page {currentPage} of {pagination.totalPages}
                                </span>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => loadPage(currentPage + 1)}
                                disabled={!pagination.hasNextPage || loading}
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex min-h-[400px] items-center justify-center">
                    <p className="text-muted-foreground">No ongoing anime found.</p>
                </div>
            )}
        </div>
    );
}
