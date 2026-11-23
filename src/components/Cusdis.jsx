'use client';

import Script from 'next/script';
import { useEffect } from 'react';

export default function Cusdis({ pageId, pageTitle, pageUrl }) {
  
  // Fungsi untuk refresh widget dengan aman
  useEffect(() => {
    const renderCusdis = () => {
      if (window.CUSDIS && typeof window.CUSDIS.renderWidget === 'function') {
        window.CUSDIS.renderWidget();
      }
    };

    // Kita beri sedikit delay atau tunggu sampai window.CUSDIS tersedia
    renderCusdis();
  }, [pageId]);

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <div className="industrial-border mb-6">
        <h2 className="text-lg font-bold uppercase tracking-tight">Diskusi / Komentar</h2>
      </div>
      
      <div className="bg-card border border-border p-4 md:p-8 relative min-h-[200px]">
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary" />
        
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

      {/* Gunakan strategy lazyOnload agar tidak bentrok dengan player video */}
      <Script 
        src="https://cusdis.com/js/cusdis.es.js" 
        strategy="lazyOnload" 
      />
    </div>
  );
}
