"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export default function EpisodePlayer({ episode, episodeId }) {
    const [selectedQuality, setSelectedQuality] = useState("480p");
    const [selectedServer, setSelectedServer] = useState(0);
    const [serverUrl, setServerUrl] = useState(episode.defaultStreamingUrl || "");

    // Get available qualities from server
    const qualities = episode.server?.qualities?.filter(q => q.serverList && q.serverList.length > 0) || [];
    const currentQuality = qualities.find(q => q.title === selectedQuality) || qualities[0];
    const servers = currentQuality?.serverList || [];

    // Fetch server URL when server changes
    useEffect(() => {
        const fetchServerUrl = async () => {
            if (servers[selectedServer]) {
                try {
                    const response = await fetch(`/api/server/${servers[selectedServer].serverId}`);
                    const data = await response.json();
                    setServerUrl(data.data?.url || episode.defaultStreamingUrl || "");
                } catch (error) {
                    console.error("Failed to fetch server URL:", error);
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

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
            {/* Left Column - Video Player */}
            <div className="space-y-4">
                {/* Video Player */}
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    {serverUrl ? (
                        <iframe
                            src={serverUrl}
                            className="w-full h-full"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-white">
                            No video available
                        </div>
                    )}
                </div>

                {/* Video Controls */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-4">
                            {/* Quality Selector */}
                            {qualities.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">Quality:</span>
                                    <Select value={selectedQuality} onValueChange={(value) => {
                                        setSelectedQuality(value);
                                        setSelectedServer(0);
                                    }}>
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {qualities.map((quality) => (
                                                <SelectItem key={quality.title} value={quality.title}>
                                                    {quality.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Server Selector */}
                            {servers.length > 0 && (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-medium">Server:</span>
                                    <div className="flex gap-2 flex-wrap">
                                        {servers.map((server, index) => (
                                            <Button
                                                key={index}
                                                variant={selectedServer === index ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setSelectedServer(index)}
                                            >
                                                {server.title}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Navigation Buttons */}
                <div className="flex gap-3">
                    {episode.hasPrevEpisode && episode.prevEpisode && (
                        <Link href={`/episode/${episode.prevEpisode.episodeId}`} className="flex-1">
                            <Button variant="outline" className="w-full">
                                ← Previous Episode
                            </Button>
                        </Link>
                    )}
                    {episode.hasNextEpisode && episode.nextEpisode && (
                        <Link href={`/episode/${episode.nextEpisode.episodeId}`} className="flex-1">
                            <Button variant="outline" className="w-full">
                                Next Episode →
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Episode Info */}
                <Card>
                    <CardContent className="p-4 space-y-3">
                        <h1 className="text-xl font-bold">{episode.title}</h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Link
                                href={`/anime/${episode.animeId}`}
                                className="hover:text-foreground hover:underline"
                            >
                                Back to Anime
                            </Link>
                            {episode.releasedOn && <span>• {episode.releasedOn}</span>}
                        </div>
                        {episode.genreList && episode.genreList.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {episode.genreList.map((genre) => (
                                    <Badge key={genre.genreId} variant="outline">
                                        {genre.title}
                                    </Badge>

                                ))}
                            </div>

                        )}
                    </CardContent>
                    <CardContent className="p-4 space-y-2">
                        <h3 className="font-semibold">Synopsis</h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            {episode.synopsis.paragraphs.map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>
                        {episode.synopsis.connections && episode.synopsis.connections.length > 0 && (
                            <div className="mt-3 space-y-2">
                                <h4 className="text-sm font-semibold text-foreground">Related Anime:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {episode.synopsis.connections.map((connection, index) => (
                                        <Link
                                            key={index}
                                            href={`/anime/${connection.animeId}`}
                                            className="inline-flex items-center rounded-md border border-input bg-background px-3 py-1.5 text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                                        >
                                            {connection.title}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Download Links with Accordion */}
                {episode.downloadUrl?.formats && episode.downloadUrl.formats.length > 0 && (
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="font-semibold mb-3">Download Links</h3>
                            <Accordion type="single" className="w-full">
                                {episode.downloadUrl.formats.map((format, formatIndex) => (
                                    <AccordionItem key={formatIndex} value={`format-${formatIndex}`}>
                                        <AccordionTrigger value={`format-${formatIndex}`} className="hover:no-underline">
                                            <span className="text-sm font-medium">{format.title}</span>
                                        </AccordionTrigger>
                                        <AccordionContent value={`format-${formatIndex}`}>
                                            <div className="space-y-3 pt-2">
                                                {format.qualities?.map((quality, qualityIndex) => (
                                                    <div key={qualityIndex} className="space-y-1">
                                                        <p className="text-xs font-medium text-muted-foreground">{quality.title}</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {quality.urls?.map((urlData, urlIndex) => (
                                                                <a
                                                                    key={urlIndex}
                                                                    href={urlData.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                                                                >
                                                                    {urlData.title}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Right Column - Other Episodes */}
            <div className="space-y-4">
                {episode.recommendedEpisodeList && episode.recommendedEpisodeList.length > 0 && (
                    <Card>
                        <CardContent className="p-4">
                            <h2 className="font-bold mb-4">Other Episodes</h2>
                            <div className="space-y-3 max-h-[800px] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                                {episode.recommendedEpisodeList.map((recEpisode, index) => {
                                    const actualEpisodeId = recEpisode.href?.split('/').pop() || recEpisode.episodeId;

                                    return (
                                        <Link
                                            key={`${actualEpisodeId}-${index}`}
                                            href={`/episode/${actualEpisodeId}`}
                                            className={`flex gap-3 group p-2 rounded-lg transition-colors ${actualEpisodeId === episodeId
                                                ? 'bg-primary/10 border'
                                                : 'hover:bg-accent'
                                                }`}
                                        >
                                            <div className="relative w-32 h-20 rounded overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={recEpisode.poster}
                                                    alt={recEpisode.title}
                                                    fill
                                                    sizes="128px"
                                                    className="object-cover group-hover:scale-105 transition-transform"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium line-clamp-2 ${actualEpisodeId === episodeId ? 'text-primary' : 'group-hover:text-primary'
                                                    }`}>
                                                    {recEpisode.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {recEpisode.releaseDate}
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Recommended Movies */}
                {episode.movie?.animeList && episode.movie.animeList.length > 0 && (
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="font-bold mb-3">Recommended Movies</h3>
                            <div className="space-y-3">
                                {episode.movie.animeList.slice(0, 3).map((movie) => (
                                    <Link
                                        key={movie.animeId}
                                        href={`/anime/${movie.animeId}`}
                                        className="flex gap-3 group"
                                    >
                                        <div className="relative w-20 h-28 rounded overflow-hidden flex-shrink-0">
                                            <Image
                                                src={movie.poster}
                                                alt={movie.title}
                                                fill
                                                sizes="80px"
                                                className="object-cover group-hover:scale-105 transition-transform"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium line-clamp-2 group-hover:text-primary">
                                                {movie.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {movie.releaseDate}
                                            </p>
                                            {movie.genreList && movie.genreList.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {movie.genreList.slice(0, 2).map((genre) => (
                                                        <Badge key={genre.genreId} variant="outline" className="text-xs">
                                                            {genre.title}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
