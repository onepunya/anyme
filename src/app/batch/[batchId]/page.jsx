import { getBatchDetail } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AnimeCard from "@/components/AnimeCard";

export async function generateMetadata({ params }) {
    const { batchId } = await params;
    try {
        const response = await getBatchDetail(batchId);
        const batch = response.data;
        return {
            title: `${batch.title || 'Batch Download'} - KaelNime`,
            description: batch.synopsis?.paragraphs?.[0] || 'Download anime batch',
        };
    } catch (error) {
        return {
            title: 'Batch Download - KaelNime',
            description: 'Download anime batch',
        };
    }
}

export default async function BatchDetailPage({ params }) {
    const { batchId } = await params;
    const response = await getBatchDetail(batchId);
    const batch = response.data;

    return (
        <div className="space-y-8">
            {/* Header with Poster */}
            <div className="grid gap-8 md:grid-cols-[200px_1fr]">
                {batch.poster && (
                    <div className="relative w-[150px] h-[210px] mx-auto md:mx-0 md:w-full md:h-[280px] overflow-hidden rounded-lg border">
                        <Image
                            src={batch.poster}
                            alt={batch.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                )}

                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground transition-colors">
                            Home
                        </Link>
                        <span>/</span>
                        <Link href={`/anime/${batch.animeId}`} className="hover:text-foreground transition-colors">
                            {batch.english || batch.title}
                        </Link>
                        <span>/</span>
                        <span>Batch Download</span>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{batch.title}</h1>

                    <div className="flex flex-wrap gap-2 text-sm">
                        {batch.score && (
                            <Badge variant="outline">⭐ {batch.score}</Badge>
                        )}
                        {batch.status && (
                            <Badge variant="outline">{batch.status}</Badge>
                        )}
                        {batch.type && (
                            <Badge variant="outline">{batch.type}</Badge>
                        )}
                        {batch.episodes && (
                            <Badge variant="outline">{batch.episodes} Episodes</Badge>
                        )}
                    </div>

                    {batch.synopsis?.paragraphs && (
                        <div className="text-sm text-muted-foreground">
                            {batch.synopsis.paragraphs.map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Download Links */}
            {batch.downloadUrl?.formats && batch.downloadUrl.formats.length > 0 && (
                <div className="space-y-6">
                    {batch.downloadUrl.formats.map((format, formatIndex) => (
                        <Card key={formatIndex}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    📥 {format.title} Format
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {format.qualities?.map((quality, qualityIndex) => (
                                    <div key={qualityIndex} className="space-y-3">
                                        {/* Quality Header */}
                                        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg">
                                            <Badge variant="default" className="font-bold">
                                                {format.title} {quality.title}
                                            </Badge>
                                        </div>

                                        {/* Download Links */}
                                        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                            {quality.urls?.map((link, linkIndex) => (
                                                <a
                                                    key={linkIndex}
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between gap-2 rounded-md border border-input bg-background px-4 py-3 text-sm font-medium transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-md"
                                                >
                                                    <span>{link.title}</span>
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="16"
                                                        height="16"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                                        <polyline points="15 3 21 3 21 9" />
                                                        <line x1="10" x2="21" y1="14" y2="3" />
                                                    </svg>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Recommended Anime */}
            {batch.recommendedAnimeList && batch.recommendedAnimeList.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight">Recommended Anime</h2>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {batch.recommendedAnimeList.map((anime) => (
                            <AnimeCard key={anime.animeId} anime={anime} showRank={false} />
                        ))}
                    </div>
                </div>
            )}

            {/* Back Button */}
            <div className="flex justify-center gap-4">
                <Link href={`/anime/${batch.animeId}`}>
                    <Button variant="outline">
                        ← Back to Anime
                    </Button>
                </Link>
                <Link href="/">
                    <Button variant="outline">
                        🏠 Home
                    </Button>
                </Link>
            </div>
        </div>
    );
}
