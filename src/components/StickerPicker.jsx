"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { imageToSquare, uploadMedia } from "@/lib/imageTools";

export default function StickerPicker({ onPick, onClose }) {
  const [stickers, setStickers] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/stickers", { cache: "no-store" });
      const data = await res.json();
      setStickers(data.stickers || []);
    } catch {
      setStickers([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setErr("");
    try {
      const blob = await imageToSquare(file, { size: 256, mode: "contain", maxBytes: 110 * 1024 });
      const id = await uploadMedia("sticker", blob);
      await load();
      onPick(id); // langsung dipilih setelah dibuat
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border border-border bg-background p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest">Stikerku</p>
        <button type="button" onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">
          Tutup
        </button>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto">
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="aspect-square border border-dashed border-primary/60 text-primary text-[11px] font-bold uppercase leading-tight hover:bg-primary/10 disabled:opacity-50 transition-colors"
        >
          {busy ? "..." : "+ Buat dari gambar"}
        </button>
        {stickers === null && <p className="col-span-3 text-xs text-muted-foreground self-center">Memuat...</p>}
        {stickers?.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onPick(id)}
            className="aspect-square border border-border hover:border-primary transition-colors p-1"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/media/${id}`} alt="stiker" loading="lazy" className="h-full w-full object-contain" />
          </button>
        ))}
      </div>

      <input ref={fileRef} type="file" accept="image/*" onChange={create} className="hidden" />
      {err && <p className="text-xs text-red-500">{err}</p>}
      <p className="text-[10px] text-muted-foreground">
        Gambar otomatis dijadikan stiker 256×256. Maksimal 30 stiker per akun.
      </p>
    </div>
  );
}
