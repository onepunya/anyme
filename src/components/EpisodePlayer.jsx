
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import BatchAccordion from "@/components/BatchAccordion";
import { useWatchHistory } from "@/lib/useWatchHistory";

export default function EpisodePlayer({ episode, episodeId }) {
    const [selectedQuality, setSelectedQuality] = useState("480p");
    const [selectedServer, setSelectedServer] = useState(0);
    const [serverUrl, setServerUrl] = useState(episode.defaultStreamingUrl || "");
    const { addToHistory } = useWatchHistory();

    const qualities = episode.server?.qualities?.filter(q => q.serverList && q.serverList.length > 0) || [];
    const currentQuality = qualities.find(q => q.title === selectedQuality) || qualities[0];
    const servers = currentQuality?.serverList || [];

    // Fetch server URL
    useEffect(() => {
        const fetchServerUrl = async () => {
            if (servers[selectedServer]) {
                try {
                    const response = await fetch(`/api/server/${servers[selectedServer].serverId}`);
                    const data = await response.json();
                    setServerUrl(data.data?.url || episode.defaultStreamingUrl || "");
                } catch (error) {
                    setServerUrl(episode.defaultStreamingUrl || "");
                }
            } else {
                setServerUrl(episode.defaultStreamingUrl || "");
            }
        };
        fetchServerUrl();
    }, [selectedServer, servers, episode.defaultStreamingUrl]);

    // Set initial quality
    useEffect(() => {
        if (qualities.length > 0 && !qualities.find(q => q.title === selectedQuality)) {
            setSelectedQuality(qualities[0].title);
        }
    }, [qualities]);

    // ✅ SAVE HISTORY
    useEffect(() => {
        if (!episode || !episodeId) return;
        addToHistory({
            episodeId,
            animeId: episode.animeId,
            title: episode.title,
            episodeTitle: episode.title,
            animeTitle: episode.title?.split(" Episode")[0] || episode.title,
            poster: episode.poster || episode.recommendedEpisodeList?.[0]?.poster || "",
            releasedOn: episode.releasedOn,
        });
    }, [episodeId]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 pb-10">

            {/* Left Column */}
            <div className="space-y-4">

                {/* Video Player */}
                <div className="relative aspect-video bg-black border border-border overflow-hidden">
                    {serverUrl ? (
                        <iframe
                            src={serverUrl}
                            className="w-full h-full"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-white text-sm uppercase tracking-widest">
                            No video available
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="border border-border bg-card p-3 space-y-3">
                    <div className="flex flex-wrap items-center gap-4">
                        {qualities.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider">Quality:</span>
                                <div className="flex gap-1.5 flex-wrap">
                                    {qualities.map((quality) => (
                                        <button
                                            key={quality.title}
                                            onClick={() => { setSelectedQuality(quality.title); setSelectedServer(0); }}
                                            className={`px-3 py-1 text-xs font-bold uppercase border transition-colors ${selectedQuality === quality.title
                                                ? 'bg-primary text-primary-foreground border-primary'
                                                : 'border-border hover:border-primary hover:text-primary'
                                                }`}
                                        >
                                            {quality.title}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {servers.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold uppercase tracking-wider">Server:</span>
                                <div className="flex gap-1.5 flex-wrap">
                                    {servers.map((server, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedServer(index)}
                                            className={`px-3 py-1 text-xs font-bold uppercase border transition-colors ${selectedServer === index
                                                ? 'bg-primary text-primary-foreground border-primary'
                                                : 'border-border hover:border-primary hover:text-primary'
                                                }`}
                                        >
                                            {server.title}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-2">
                    {episode.hasPrevEpisode && episode.prevEpisode && (
                        <Link
                            href={`/episode/${episode.prevEpisode.episodeId}`}
                            className="flex-1 text-center text-xs font-bold uppercase tracking-wider py-2.5 border border-border hover:border-primary hover:text-primary transition-colors"
                        >
                            ← Previous
                        </Link>
                    )}
                    {episode.hasNextEpisode && episode.nextEpisode && (
                        <Link
                            href={`/episode/${episode.nextEpisode.episodeId}`}
                            className="flex-1 text-center text-xs font-bold uppercase tracking-wider py-2.5 border border-border hover:border-primary hover:text-primary transition-colors"
                        >
                            Next →
                        </Link>
                    )}
                </div>

                {/* Episode Info */}
                <div className="border border-border bg-card p-4 space-y-3">
                    <div className="industrial-border">
                        <h1 className="text-lg font-bold uppercase tracking-tight">{episode.title}</h1>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Link href={`/anime/${episode.animeId}`} className="hover:text-primary transition-colors uppercase tracking-wider">
                                ← Back to Anime
                            </Link>
                            {episode.releasedOn && <span>• {episode.releasedOn}</span>}
                        </div>
                    </div>

                    {episode.genreList?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {episode.genreList.map((genre) => (
                                <Link
                                    key={genre.genreId}
                                    href={`/genres/${genre.genreId}`}
                                    className="text-xs px-2 py-0.5 border border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-colors uppercase tracking-wider"
                                >
                                    {genre.title}
                                </Link>
                            ))}
                        </div>
                    )}

                    {episode.synopsis?.paragraphs && (
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Synopsis</h3>
                            <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                                {episode.synopsis.paragraphs.map((paragraph, index) => (
                                    <p key={index}>{paragraph}</p>
                                ))}
                            </div>
                            {episode.synopsis.connections?.length > 0 && (
                                <div className="mt-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider mb-2">Related Anime</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {episode.synopsis.connections.map((connection, index) => (
                                            <Link
                                                key={index}
                                                href={`/anime/${connection.animeId}`}
                                                className="text-xs px-2 py-1 border border-border hover:border-primary hover:text-primary transition-colors"
                                            >
                                                {connection.title}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Download Links */}
                {episode.downloadUrl?.formats?.length > 0 && (
                    <div>
                        <div className="industrial-border mb-3">
                            <h3 className="text-sm font-bold uppercase tracking-tight">Download Links</h3>
                        </div>
                        <BatchAccordion formats={episode.downloadUrl.formats} />
                    </div>
                )}
            </div>

            {/* Right Column */}
            <div className="space-y-4">

                {episode.recommendedEpisodeList?.length > 0 && (
                    <div className="border border-border bg-card">
                        <div className="px-4 py-3 border-b border-border">
                            <h2 className="text-xs font-bold uppercase tracking-widest">Other Episodes</h2>
                        </div>
                        <div className="space-y-0 max-h-[600px] overflow-y-auto">
                            {episode.recommendedEpisodeList.map((recEpisode, index) => {
                                const actualEpisodeId = recEpisode.href?.split('/').pop() || recEpisode.episodeId;
                                const isActive = actualEpisodeId === episodeId;
                                return (
                                    <Link
                                        key={`${actualEpisodeId}-${index}`}
                                        href={`/episode/${actualEpisodeId}`}
                                        className={`flex gap-3 p-3 border-b border-border/50 last:border-0 group transition-colors ${isActive ? 'bg-primary/10 border-l-2 border-l-primary' : 'hover:bg-card'}`}
                                    >
                                        <div className="relative w-28 h-16 overflow-hidden flex-shrink-0 border border-border">
                                            <Image
                                                src={recEpisode.poster}
                                                alt={recEpisode.title}
                                                fill
                                                sizes="112px"
                                                className="object-cover group-hover:scale-105 transition-transform"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-bold line-clamp-2 leading-tight ${isActive ? 'text-primary' : 'group-hover:text-primary transition-colors'}`}>
                                                {recEpisode.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">{recEpisode.releaseDate}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {episode.movie?.animeList?.length > 0 && (
                    <div className="border border-border bg-card">
                        <div className="px-4 py-3 border-b border-border">
                            <h3 className="text-xs font-bold uppercase tracking-widest">Recommended Movies</h3>
                        </div>
                        <div className="p-3 space-y-3">
                            {episode.movie.animeList.slice(0, 3).map((movie) => (
                                <Link key={movie.animeId} href={`/anime/${movie.animeId}`} className="flex gap-3 group">
                                    <div className="relative w-16 h-24 overflow-hidden flex-shrink-0 border border-border">
                                        <Image
                                            src={movie.poster}
                                            alt={movie.title}
                                            fill
                                            sizes="64px"
                                            className="object-cover group-hover:scale-105 transition-transform"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold line-clamp-2 group-hover:text-primary transition-colors">
                                            {movie.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">{movie.releaseDate}</p>
                                        {movie.genreList?.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                                {movie.genreList.slice(0, 2).map((genre) => (
                                                    <span key={genre.genreId} className="text-xs px-1.5 py-0.5 border border-border">
                                                        {genre.title}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
