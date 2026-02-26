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
