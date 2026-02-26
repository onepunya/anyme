import Link from "next/link";

// ==============================
// GANTI INFO INI SESUAI APK KAMU
// ==============================
const APP_INFO = {
  version: "1.0.1 (3)",
  size: "9 MB",
  minAndroid: "6.0",
  updated: "26 Februari 2026",
  packageName: "com.onepunya.anyme",
  downloadUrl: "https://github.com/username/anyme/releases/download/v1.0.1/anyme.apk", // ganti
  changelog: [
    "Rilis perdana Anyme",
    "Streaming anime sub Indo gratis",
    "Tersedia fitur History & Continue Watching",
    "Support dark & light mode",
    "Bottom navigation yang mudah digunakan",
  ],
};
// ==============================

export const metadata = {
  title: "Download - Anyme",
  description: "Download aplikasi Anyme untuk nonton anime subtitle Indonesia gratis di Android.",
};

export default function DownloadPage() {
  return (
    <div className="min-h-screen pb-16">
      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* App Icon */}
            <div className="w-20 h-20 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-primary">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>

            {/* App Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Anyme</span>
                <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-sm font-mono">
                  v{APP_INFO.version}
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight uppercase mb-2">
                Download Aplikasi
              </h1>
              <p className="text-muted-foreground text-sm max-w-lg">
                Nonton anime subtitle Indonesia gratis langsung dari HP Android kamu. Ringan, cepat, dan nyaman.
              </p>
            </div>

            {/* Download Button */}
            <a
              href={APP_INFO.downloadUrl}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-bold uppercase tracking-widest text-sm hover:bg-primary/90 transition-colors glow-hover"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download APK
            </a>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Info APK */}
          <div className="metal-card p-5 space-y-4">
            <div className="industrial-border">
              <h2 className="text-xs font-bold uppercase tracking-widest">Info APK</h2>
            </div>
            <ul className="space-y-3 text-sm">
              {[
                { label: "Versi", value: APP_INFO.version },
                { label: "Ukuran", value: APP_INFO.size },
                { label: "Min. Android", value: APP_INFO.minAndroid },
                { label: "Diperbarui", value: APP_INFO.updated },
                { label: "Package", value: APP_INFO.packageName },
              ].map((item) => (
                <li key={item.label} className="flex justify-between items-start gap-4">
                  <span className="text-muted-foreground flex-shrink-0">{item.label}</span>
                  <span className="font-mono text-xs text-right break-all">{item.value}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Changelog */}
          <div className="metal-card p-5 space-y-4">
            <div className="industrial-border">
              <h2 className="text-xs font-bold uppercase tracking-widest">Changelog</h2>
              <p className="text-xs text-muted-foreground mt-0.5">v{APP_INFO.version}</p>
            </div>
            <ul className="space-y-2">
              {APP_INFO.changelog.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-0.5 flex-shrink-0">▸</span>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cara Install */}
          <div className="metal-card p-5 space-y-4">
            <div className="industrial-border">
              <h2 className="text-xs font-bold uppercase tracking-widest">Cara Install</h2>
            </div>
            <ol className="space-y-3">
              {[
                "Klik tombol Download APK di atas",
                'Buka file APK yang sudah didownload',
                'Izinkan "Install dari sumber tidak dikenal" jika diminta',
                "Klik Install dan tunggu selesai",
                "Buka Anyme dan mulai nonton! 🎌",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="w-5 h-5 flex-shrink-0 bg-primary/10 border border-primary/30 text-primary text-xs flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Fitur */}
        <div className="mt-6 metal-card p-5">
          <div className="industrial-border mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest">Fitur Unggulan</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "📺", label: "Anime Lengkap", desc: "Ribuan judul dari klasik hingga terbaru" },
              { icon: "🔤", label: "Sub Indo", desc: "Subtitle Indonesia berkualitas tinggi" },
              { icon: "📅", label: "Jadwal Tayang", desc: "Pantau anime ongoing setiap minggu" },
              { icon: "🌙", label: "Dark Mode", desc: "Tampilan nyaman di segala kondisi cahaya" },
            ].map((f) => (
              <div key={f.label} className="flex items-start gap-3 p-3 border border-border hover:border-primary/30 transition-colors">
                <span className="text-xl">{f.icon}</span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide">{f.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
