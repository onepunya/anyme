"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerUrl } from "@/lib/api";

export default function VideoPlayer({ episodeData }) {
  const [currentUrl, setCurrentUrl] = useState(episodeData.defaultStreamingUrl);
  const [selectedServer, setSelectedServer] = useState("default");
  const [loading, setLoading] = useState(false);

  const handleServerChange = async (serverId, serverTitle) => {
    setLoading(true);
    try {
      const response = await getServerUrl(serverId);
      if (response.status === "success" && response.data?.url) {
        setCurrentUrl(response.data.url);
        setSelectedServer(serverId);
      }
    } catch (error) {
      console.error("Failed to fetch server URL:", error);
      alert("Failed to load server. Please try another server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <div className="relative aspect-video bg-black">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-white border-r-transparent" />
                  <p className="mt-4 text-white">Loading video...</p>
                </div>
              </div>
            ) : (
              <iframe
                key={currentUrl}
                src={currentUrl}
                className="h-full w-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title="Video Player"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {episodeData.server?.qualities && episodeData.server.qualities.some(q => q.serverList && q.serverList.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quality & Server Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {episodeData.server.qualities.map((quality) => (
              quality.serverList && quality.serverList.length > 0 && (
                <div key={quality.title}>
                  <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
                    {quality.title}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {quality.serverList.map((server) => (
                      <Button
                        key={server.serverId}
                        variant={selectedServer === server.serverId ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleServerChange(server.serverId, server.title)}
                        disabled={loading}
                      >
                        {server.title}
                      </Button>
                    ))}
                  </div>
                </div>
              )
            ))}
          </CardContent>
        </Card>
      )}

      {(episodeData.hasPrevEpisode || episodeData.hasNextEpisode) && (
        <Card>
          <CardContent className="flex justify-between gap-2 p-4">
            {episodeData.hasPrevEpisode && episodeData.prevEpisode ? (
              <a
                href={`/episode/${episodeData.prevEpisode.episodeId}`}
                className="flex h-10 flex-1 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                ← Previous Episode
              </a>
            ) : (
              <div className="flex-1" />
            )}
            {episodeData.hasNextEpisode && episodeData.nextEpisode ? (
              <a
                href={`/episode/${episodeData.nextEpisode.episodeId}`}
                className="flex h-10 flex-1 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Next Episode →
              </a>
            ) : (
              <div className="flex-1" />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
