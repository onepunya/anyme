export const dynamic = 'force-dynamic';

import { getBatchDetail } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";
import AnimeCard from "@/components/AnimeCard";
import BatchAccordion from "@/components/BatchAccordion";

export async function generateMetadata({ params }) {
    const { batchId } = await params;
    try {
        const response = await getBatchDetail(batchId);
        const batch = response.data;
        return {
            title: `${batch.title || 'Batch Download'} - Anyme`,
            description: batch.synopsis?.paragraphs?.[0] || 'Download anime batch',
        };
    } catch (error) {
        return {
            title: 'Batch Download - Anyme',
            description: 'Download anime batch',
        };
    }
}

export default async function BatchDetailPage({ params }) {
    const { batchId } = await params;
    const response = await getBatchDetail(batchId);
    const batch = response.data;

    return (
        <div className="space-y-8 pb-10">

            {/* Header */}
            <div className="grid gap-6 md:grid-cols-[200px_1fr]">
                {batch.poster && (
                    <div className="relative w-[150px] h-[210px] mx-auto md:mx-0 md:w-full md:h-[280px] overflow-hidden border-2 border-border">
                        <Image
                            src={batch.poster}
                            alt={batch.title}
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
                    </div>
                )}

                <div className="space-y-4">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <span>/</span>
                        <Link href={`/anime/${batch.animeId}`} className="hover:text-primary transition-colors">
                            {batch.english || batch.title}
                        </Link>
                        <span>/</span>
                        <span className="text-primary">Batch</span>
                    </div>

                    {/* Title */}
                    <div className="industrial-border">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight uppercase">
                            {batch.title}
                        </h1>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                        {batch.score && (
                            <span className="text-xs px-2 py-1 border border-primary/50 text-primary uppercase tracking-wider">
                                ⭐ {batch.score}
                            </span>
                        )}
                        {batch.status && (
                            <span className="text-xs px-2 py-1 border border-border uppercase tracking-wider">
                                {batch.status}
                            </span>
                        )}
                        {batch.type && (
                            <span className="text-xs px-2 py-1 border border-border uppercase tracking-wider">
                                {batch.type}
                            </span>
                        )}
                        {batch.episodes && (
                            <span className="text-xs px-2 py-1 border border-border uppercase tracking-wider">
                                {batch.episodes} EPS
                            </span>
                        )}
                    </div>

                    {/* Synopsis */}
                    {batch.synopsis?.paragraphs && (
                        <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">
                            {batch.synopsis.paragraphs.map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Download Links */}
            {batch.downloadUrl?.formats?.length > 0 && (
                <div>
                    <div className="industrial-border mb-4">
                        <h2 className="text-lg font-bold uppercase tracking-tight">Download Links</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {batch.downloadUrl.formats.length} format tersedia
                        </p>
                    </div>
                    <BatchAccordion formats={batch.downloadUrl.formats} />
                </div>
            )}

            {/* Recommended */}
            {batch.recommendedAnimeList?.length > 0 && (
                <div>
                    <div className="industrial-border mb-4">
                        <h2 className="text-lg font-bold uppercase tracking-tight">Recommended Anime</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                        {batch.recommendedAnimeList.map((anime) => (
                            <AnimeCard key={anime.animeId} anime={anime} showRank={false} />
                        ))}
                    </div>
                </div>
            )}

            {/* Back Buttons */}
            <div className="flex gap-3">
                <Link
                    href={`/anime/${batch.animeId}`}
                    className="text-sm font-bold uppercase tracking-wider px-4 py-2 border border-border hover:border-primary hover:text-primary transition-colors"
                >
                    ← Back to Anime
                </Link>
                <Link
                    href="/"
                    className="text-sm font-bold uppercase tracking-wider px-4 py-2 border border-border hover:border-primary hover:text-primary transition-colors"
                >
                    🏠 Home
                </Link>
            </div>

        </div>
    );
}
```

Karena pakai accordion tapi kita hapus dependency UI, buat file baru **`BatchAccordion.jsx`** di folder components:

```jsx
'use client';

import { useState } from "react";

export default function BatchAccordion({ formats }) {
    const [openIndex, setOpenIndex] = useState(null);

    const toggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="space-y-2">
            {formats.map((format, formatIndex) => (
                <div key={formatIndex} className="border border-border">
                    {/* Trigger */}
                    <button
                        onClick={() => toggle(formatIndex)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-primary/5 transition-colors text-left"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 bg-primary text-primary-foreground">
                                {format.title}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {format.qualities?.length || 0} qualities
                            </span>
                        </div>
                        <span className={`text-primary transition-transform duration-200 ${openIndex === formatIndex ? 'rotate-180' : ''}`}>
                            ▼
                        </span>
                    </button>

                    {/* Content */}
                    {openIndex === formatIndex && (
                        <div className="px-4 py-4 space-y-5 bg-background border-t border-border">
                            {format.qualities?.map((quality, qualityIndex) => (
                                <div key={qualityIndex} className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-4 bg-primary" />
                                        <span className="text-xs font-bold uppercase tracking-wider">
                                            {format.title} {quality.title}
                                        </span>
                                    </div>
                                    <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                                        {quality.urls?.map((link, linkIndex) => (
                                            <a
                                                key={linkIndex}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between gap-2 border border-border bg-card px-3 py-2.5 text-xs font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                                            >
                                                <span>{link.title}</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                                    <polyline points="15 3 21 3 21 9" />
                                                    <line x1="10" x2="21" y1="14" y2="3" />
                                                </svg>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}