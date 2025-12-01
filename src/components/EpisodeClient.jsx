"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

export default function EpisodeClient({ episode, episodeId }) {
    const [selectedQuality, setSelectedQuality] = useState("480p");
    const [selectedServer, setSelectedServer] = useState(0);
    const [serverUrl, setServerUrl] = useState("");
    const [episodeList, setEpisodeList] = useState([]);

    // Get available qualities from server
    const qualities = episode.server?.qualities?.filter(q => q.serverList && q.serverList.length > 0) || [];
    const currentQuality = qualities.find(q => q.title === selectedQuality) || qualities[0];
    const servers = currentQuality?.serverList || [];

    // Fetch episode list from anime detail
    useEffect(() => {
        const fetchEpisodeList = async () => {
            try {
                const response = await fetch(`/api/anime/${episode.animeId}`);
                const data = await response.json();
                setEpisodeList(data.data?.episodeList || []);
            } catch (error) {
                console.error("Failed to fetch episode list:", error);
            }
        };

        if (episode.animeId) {
            fetchEpisodeList();
        }
    }, [episode.animeId]);

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
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
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
                </Card>

                {/* Synopsis */}
                {episode.synopsis?.paragraphs && episode.synopsis.paragraphs.length > 0 && (
                    <Card>
                        <CardContent className="p-4 space-y-2">
                            <h3 className="font-semibold">Synopsis</h3>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                {episode.synopsis.paragraphs.map((paragraph, index) => (
                                    <p key={index}>{paragraph}</p>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Right Column - Episode List */}
            <div className="space-y-4">
                <Card>
                    <CardContent className="p-4">
                        <h2 className="font-bold mb-4">Semua Episode</h2>

                        {/* Tab for different ranges */}
                        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                            <Button variant="default" size="sm">1-9</Button>
                            <Button variant="outline" size="sm">PV & More</Button>
                        </div>

                        {/* Episode Grid */}
                        <div className="grid grid-cols-4 gap-2 max-h-[600px] overflow-y-auto">
                            {episodeList.map((ep) => (
                                <Link
                                    key={ep.episodeId}
                                    href={`/episode/${ep.episodeId}`}
                                    className={`
                    flex items-center justify-center
                    rounded-md border p-3
                    text-sm font-medium
                    transition-colors
                    ${ep.episodeId === episodeId
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'hover:bg-accent hover:text-accent-foreground'
                                        }
                  `}
                                >
                                    E{ep.title}
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Serial Section */}
                {episode.recommendedEpisodeList && episode.recommendedEpisodeList.length > 0 && (
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="font-bold mb-3">Serial</h3>
                            <div className="space-y-3">
                                {episode.recommendedEpisodeList.slice(0, 3).map((recEp) => (
                                    <Link
                                        key={recEp.episodeId}
                                        href={`/episode/${recEp.episodeId}`}
                                        className="flex gap-3 group"
                                    >
                                        <div className="relative w-24 h-16 rounded overflow-hidden flex-shrink-0">
                                            <img
                                                src={recEp.poster}
                                                alt={recEp.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium line-clamp-2 group-hover:text-primary">
                                                {recEp.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {recEp.releaseDate}
                                            </p>
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
