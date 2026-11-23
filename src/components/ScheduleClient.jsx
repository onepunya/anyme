"use client";

import { useState } from "react";
import AnimeCard from "@/components/AnimeCard";

export default function ScheduleClient({ scheduleData }) {
    const days = scheduleData?.data?.days || [];
    const [selectedDay, setSelectedDay] = useState(days[0]?.day || "");

    const currentDayAnime = days.find((d) => d.day === selectedDay)?.animeList || [];

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Anime Schedule</h1>
                <p className="text-muted-foreground">
                    Browse anime by release day of the week
                </p>
            </div>

            {/* Day Selector */}
            <div className="flex flex-wrap gap-2">
                {days.map((dayData) => (
                    <button
                        key={dayData.day}
                        onClick={() => setSelectedDay(dayData.day)}
                        className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${selectedDay === dayData.day
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                    >
                        {dayData.day}
                        <span className="ml-2 text-xs opacity-70">
                            ({dayData.animeList.length})
                        </span>
                    </button>
                ))}
            </div>

            {/* Anime Grid */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                    {selectedDay} - {currentDayAnime.length} Anime
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {currentDayAnime.map((anime) => (
                        <AnimeCard key={anime.animeId} anime={anime} showRank={false} />
                    ))}
                </div>
            </div>
        </div>
    );
}
