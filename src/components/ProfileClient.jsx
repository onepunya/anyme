"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import AuthBox from "@/components/AuthBox";
import { useAuth } from "@/lib/useAuth";
import { imageToSquare, uploadMedia } from "@/lib/imageTools";
import { NAME_COLORS } from "@/lib/profileColors";

const field =
  "w-full bg-background border border-border px-3 py-2 text-xs focus:outline-none focus:border-primary transition-colors";

export default function ProfileClient() {
  const { user, setUser, loading, refresh, logout } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [color, setColor] = useState("default");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [uploading, setUploading] = useState(false);
  const [stickers, setStickers] = useState([]);
  const avatarRef = useRef(null);
  const stickerRef = useRef(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setBio(user.bio || "");
      setColor(user.color || "default");
    }
  }, [user]);

  const loadStickers = async () => {
    try {
      const res = await fetch("/api/stickers", { cache: "no-store" });
      setStickers((await res.json()).stickers || []);
    } catch {}
  };

  useEffect(() => {
    if (user) loadStickers();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const flash = (m, isErr = false) => {
    setMsg(isErr ? "" : m);
    setErr(isErr ? m : "");
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    flash("");
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, bio, color }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
      setUser(data.user);
      flash("Profil tersimpan");
    } catch (e2) {
      flash(e2.message, true);
    } finally {
      setSaving(false);
    }
  };

  const pickAvatar = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    flash("");
    try {
      const blob = await imageToSquare(file, { size: 192, mode: "cover", maxBytes: 55 * 1024 });
      await uploadMedia("avatar", blob);
      await refresh();
      flash("Foto profil diperbarui");
    } catch (e2) {
      flash(e2.message, true);
    } finally {
      setUploading(false);
    }
  };

  const addSticker = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    flash("");
    try {
      const blob = await imageToSquare(file, { size: 256, mode: "contain", maxBytes: 110 * 1024 });
      await uploadMedia("sticker", blob);
      await loadStickers();
      flash("Stiker ditambahkan");
    } catch (e2) {
      flash(e2.message, true);
    } finally {
      setUploading(false);
    }
  };

  const removeSticker = async (id) => {
    if (!confirm("Hapus stiker ini? Stiker di komentar lama juga ikut hilang.")) return;
    const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
    if (res.ok) setStickers((s) => s.filter((x) => x !== id));
    else flash("Gagal menghapus stiker", true);
  };

  if (loading) return <p className="text-xs text-muted-foreground">Memuat...</p>;

  if (!user) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Masuk untuk punya profil, komentar, dan stiker sendiri.</p>
        <AuthBox onAuth={setUser} />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Profil */}
      <form onSubmit={save} className="metal-card p-5 space-y-4">
        <div className="flex items-center gap-4">
          <Avatar avatarId={user.avatarId} name={user.displayName} size={72} />
          <div className="space-y-1">
            <p className={`text-lg font-bold ${NAME_COLORS[color]?.text || ""}`}>{displayName || user.username}</p>
            <p className="text-xs text-muted-foreground">@{user.username}</p>
            <button
              type="button"
              disabled={uploading}
              onClick={() => avatarRef.current?.click()}
              className="text-[11px] uppercase tracking-widest text-primary hover:underline disabled:opacity-50"
            >
              {uploading ? "Mengunggah..." : "Ganti foto"}
            </button>
            <input ref={avatarRef} type="file" accept="image/*" onChange={pickAvatar} className="hidden" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Nama tampilan</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={30} required className={field} />
        </div>

        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={160} rows={2} className={`${field} resize-y`} />
          <p className="text-[10px] text-muted-foreground text-right">{bio.length}/160</p>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Warna nama</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(NAME_COLORS).map(([key, c]) => (
              <button
                key={key}
                type="button"
                onClick={() => setColor(key)}
                className={`flex items-center gap-1.5 border px-2.5 py-1.5 text-xs transition-colors ${
                  color === key ? "border-primary" : "border-border hover:border-primary/50"
                }`}
              >
                <span className={`h-3 w-3 rounded-full ${c.dot}`} />
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-primary-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
          <button
            type="button"
            onClick={logout}
            className="px-3 py-2.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-red-500 transition-colors"
          >
            Keluar
          </button>
        </div>
        {msg && <p className="text-xs text-emerald-500">{msg}</p>}
        {err && <p className="text-xs text-red-500">{err}</p>}
      </form>

      {/* Stiker */}
      <div className="metal-card p-5 space-y-4">
        <div className="industrial-border">
          <h2 className="text-sm font-bold uppercase tracking-widest">Stikerku</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{stickers.length}/30 · dibuat dari gambar yang kamu unggah</p>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          <button
            type="button"
            disabled={uploading || stickers.length >= 30}
            onClick={() => stickerRef.current?.click()}
            className="aspect-square border border-dashed border-primary/60 text-primary text-[11px] font-bold uppercase leading-tight hover:bg-primary/10 disabled:opacity-50 transition-colors"
          >
            + Buat dari gambar
          </button>
          {stickers.map((id) => (
            <div key={id} className="relative aspect-square border border-border p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/media/${id}`} alt="stiker" loading="lazy" className="h-full w-full object-contain" />
              <button
                type="button"
                onClick={() => removeSticker(id)}
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs leading-5"
                aria-label="Hapus stiker"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <input ref={stickerRef} type="file" accept="image/*" onChange={addSticker} className="hidden" />
      </div>

      <Link href="/" className="inline-block text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">
        ← Kembali ke Beranda
      </Link>
    </div>
  );
}
