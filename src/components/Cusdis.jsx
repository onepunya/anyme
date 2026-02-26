'use client';

import Script from 'next/script';
import { useEffect } from 'react';

export default function Cusdis({ pageId, pageTitle, pageUrl }) {
  useEffect(() => {
    if (window.CUSDIS) {
      window.CUSDIS.renderWidget();
    }
  }, [pageId]);

  return (
    <div className="mt-12 space-y-6">
      {/* Header Style Industrial */}
      <div className="industrial-border">
        <h2 className="text-lg font-bold uppercase tracking-tighter">
          Komentar / Diskusi
        </h2>
      </div>

      <div className="bg-card border border-border p-4 md:p-8 relative">
        {/* Dekorasi Siku Industrial */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary" />
        
        {/* Widget Cusdis dengan App ID kamu */}
        <div 
          id="cusdis_thread"
          data-host="https://cusdis.com"
          data-app-id="71104604-3c2e-4a2f-95bf-eb2c0ff2d243"
          data-page-id={pageId}
          data-page-url={pageUrl}
          data-page-title={pageTitle}
          data-theme="dark"
        ></div>
      </div>

      {/* Script Cusdis bawaan Next.js */}
      <Script 
        src="https://cusdis.com/js/cusdis.es.js" 
        strategy="afterInteractive" 
      />
    </div>
  );
}
