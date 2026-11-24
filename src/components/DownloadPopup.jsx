"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const APK_VERSION = "1.0.1";
const APK_SIZE = "9 MB";
const DOWNLOAD_URL = "https://github.com/onepunya/storage/releases/download/untagged-7620e514fad99cf80f80/Anyme.-.Anime.Streaming_1.0.1.apk"; // ganti

// Kunci per-versi: kalau nanti rilis APK baru, popup boleh muncul lagi satu kali
const PERMANENT_KEY = `anyme_popup_dismissed_v${APK_VERSION}`;
const SESSION_KEY = "anyme_popup_session_closed";

function safeGet(store, key) {
  try { return store.getItem(key); } catch { return null; }
}
function safeSet(store, key, val) {
  try { store.setItem(key, val); } catch {}
}

// Sedang dibuka di dalam aplikasi (WebView / PWA terpasang)? Tidak perlu promosi APK.
function isInsideApp() {
  const ua = navigator.userAgent || "";
  const standalone = window.matchMedia?.("(display-mode: standalone)")?.matches;
  return /; wv\)/.test(ua) || standalone;
}

export default function DownloadPopup() {
  const [show, setShow] = useState(false);
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => {
    if (
      safeGet(localStorage, "anyme_popup_dismissed") || // kunci lama
      safeGet(localStorage, PERMANENT_KEY) ||
      safeGet(sessionStorage, SESSION_KEY) ||
      isInsideApp()
    ) {
      return;
    }
    // Muncul setelah 1.5 detik
    const timer = setTimeout(() => setShow(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Tutup biasa: jangan muncul lagi selama sesi ini (sebelumnya muncul lagi tiap balik ke Home)
  const handleClose = () => {
    safeSet(sessionStorage, SESSION_KEY, "1");
    if (dontShow) safeSet(localStorage, PERMANENT_KEY, "1");
    setShow(false);
  };

  // Klik Download / Info Lanjut: user sudah merespons, jangan tampilkan lagi untuk versi ini
  const handleAction = () => {
    safeSet(localStorage, PERMANENT_KEY, "1");
    safeSet(sessionStorage, SESSION_KEY, "1");
    setShow(false);
  };

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm">
        <div className="metal-card border border-border shadow-2xl">

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary/10 border border-primary/30 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-primary">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Download Tersedia</span>
            </div>
            <button
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            <div>
              <h2 className="text-lg font-bold uppercase tracking-tight">Anyme untuk Android</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Nikmati pengalaman nonton anime yang lebih nyaman langsung dari HP kamu!
              </p>
            </div>

            {/* APK Info */}
            <div className="flex gap-2">
              <div className="flex-1 bg-background border border-border p-2 text-center">
                <p className="text-xs text-muted-foreground">Versi</p>
                <p className="text-sm font-mono font-bold">{APK_VERSION}</p>
              </div>
              <div className="flex-1 bg-background border border-border p-2 text-center">
                <p className="text-xs text-muted-foreground">Ukuran</p>
                <p className="text-sm font-mono font-bold">{APK_SIZE}</p>
              </div>
              <div className="flex-1 bg-background border border-border p-2 text-center">
                <p className="text-xs text-muted-foreground">Platform</p>
                <p className="text-sm font-mono font-bold">Android</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-1">
              <a
                href={DOWNLOAD_URL}
                onClick={handleAction}
                className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors glow-hover"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download
              </a>
              <Link
                href="/download"
                onClick={handleAction}
                className="flex-1 flex items-center justify-center gap-1.5 border border-border py-2.5 text-xs font-bold uppercase tracking-widest hover:border-primary/50 hover:text-primary transition-colors"
              >
                Info Lanjut
              </Link>
            </div>
          </div>

          {/* Footer - Dont show again */}
          <div className="px-4 pb-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div
                onClick={() => setDontShow(!dontShow)}
                className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 transition-colors ${
                  dontShow ? "bg-primary border-primary" : "border-border group-hover:border-primary/50"
                }`}
              >
                {dontShow && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2.5 h-2.5 text-primary-foreground">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                Jangan tampilkan lagi
              </span>
            </label>
          </div>

        </div>
      </div>
    </>
  );
}
