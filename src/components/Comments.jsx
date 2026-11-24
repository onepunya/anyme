"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import AuthBox from "@/components/AuthBox";
import StickerPicker from "@/components/StickerPicker";
import { useAuth } from "@/lib/useAuth";
import { NAME_COLORS } from "@/lib/profileColors";

function timeAgo(iso) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "baru saja";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function Composer({ user, onSubmit, placeholder, autoFocus, onCancel, submitLabel = "Kirim" }) {
  const [content, setContent] = useState("");
  const [stickerId, setStickerId] = useState(null);
  const [showStickers, setShowStickers] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr("");
    try {
      await onSubmit({ content, stickerId });
      setContent("");
      setStickerId(null);
      setShowStickers(false);
    } catch (e2) {
      setErr(e2.message || "Gagal mengirim");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="flex items-center gap-2 text-xs">
        <Avatar avatarId={user.avatarId} name={user.displayName} size={24} />
        <span className={`font-bold ${NAME_COLORS[user.color]?.text || ""}`}>{user.displayName}</span>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={1000}
        rows={3}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className="w-full bg-background border border-border px-3 py-2 text-xs resize-y focus:outline-none focus:border-primary transition-colors"
      />

      {stickerId && (
        <div className="relative inline-block border border-border p-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/media/${stickerId}`} alt="stiker terpilih" className="h-20 w-20 object-contain" />
          <button
            type="button"
            onClick={() => setStickerId(null)}
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs leading-5"
            aria-label="Hapus stiker"
          >
            ×
          </button>
        </div>
      )}

      {showStickers && (
        <StickerPicker
          onPick={(id) => {
            setStickerId(id);
            setShowStickers(false);
          }}
          onClose={() => setShowStickers(false)}
        />
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={busy || (!content.trim() && !stickerId)}
          className="bg-primary text-primary-foreground px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {busy ? "Mengirim..." : submitLabel}
        </button>
        <button
          type="button"
          onClick={() => setShowStickers((v) => !v)}
          className="border border-border px-3 py-2 text-xs font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
        >
          Stiker
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            Batal
          </button>
        )}
        <span className="ml-auto text-[10px] text-muted-foreground">{content.length}/1000</span>
      </div>
      {err && <p className="text-xs text-red-500">{err}</p>}
    </form>
  );
}

function Item({ c, onReply, isReply = false }) {
  return (
    <div className={`flex gap-2.5 ${isReply ? "ml-4 sm:ml-8 border-l-2 border-primary/30 pl-3" : ""}`}>
      <Avatar avatarId={c.avatar_id} name={c.name} size={isReply ? 28 : 36} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs">
          <span className={`font-bold ${NAME_COLORS[c.color]?.text || ""}`}>{c.name}</span>
          {c.username && <span className="text-muted-foreground">@{c.username}</span>}
          <span className="text-muted-foreground">· {timeAgo(c.created_at)}</span>
        </div>
        {c.content && (
          <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap break-words">{c.content}</p>
        )}
        {c.sticker_id && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/media/${c.sticker_id}`}
            alt="stiker"
            loading="lazy"
            className="mt-1 h-28 w-28 object-contain"
          />
        )}
        {onReply && (
          <button onClick={onReply} className="mt-1 block text-[11px] uppercase tracking-widest text-primary hover:underline">
            Balas
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * threadKey contoh: "anime:one-piece", "episode:<id>", "manga:<slug>", "chapter:<slug>"
 */
export default function Comments({ threadKey, title = "Diskusi / Komentar" }) {
  const { user, setUser, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [nextOffset, setNextOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  const load = useCallback(
    async (offset = 0) => {
      try {
        const res = await fetch(`/api/comments?thread=${encodeURIComponent(threadKey)}&offset=${offset}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal memuat komentar");
        setItems((prev) => (offset ? [...prev, ...data.comments] : data.comments));
        setTotal(data.total);
        setHasMore(data.hasMore);
        setNextOffset(data.nextOffset);
        setError("");
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [threadKey]
  );

  useEffect(() => {
    setLoading(true);
    setItems([]);
    setReplyTo(null);
    load(0);
  }, [load]);

  const post = async ({ content, stickerId }, parentId = null) => {
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thread: threadKey, content, stickerId, parentId }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) setUser(null); // sesi habis
    if (!res.ok) throw new Error(data.error || "Gagal mengirim komentar");
    setReplyTo(null);
    await load(0);
  };

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <div className="industrial-border mb-6">
        <h2 className="text-lg font-bold uppercase tracking-tight">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{total} komentar</p>
      </div>

      <div className="bg-card border border-border p-4 md:p-6 relative space-y-6">
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary" />

        {/* Composer / login */}
        {authLoading ? null : user ? (
          <div className="space-y-2">
            <Composer user={user} onSubmit={(v) => post(v, null)} placeholder="Tulis komentar atau diskusi..." />
            <Link href="/profile" className="text-[11px] uppercase tracking-widest text-muted-foreground hover:text-primary">
              Edit profil & stiker →
            </Link>
          </div>
        ) : showAuth ? (
          <AuthBox
            onAuth={(u) => {
              setUser(u);
              setShowAuth(false);
            }}
          />
        ) : (
          <button
            onClick={() => setShowAuth(true)}
            className="w-full sm:w-auto border border-primary text-primary px-4 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Masuk / Daftar untuk berkomentar
          </button>
        )}

        {error && (
          <p className="text-xs text-muted-foreground border border-border p-3">
            {error === "Database belum dikonfigurasi" ? "Komentar belum aktif." : error}
          </p>
        )}

        {loading ? (
          <p className="text-xs text-muted-foreground">Memuat komentar...</p>
        ) : (
          <div className="space-y-5">
            {items.length === 0 && !error && (
              <p className="text-xs text-muted-foreground">Belum ada komentar. Jadi yang pertama!</p>
            )}
            {items.map((c) => (
              <div key={c.id} className="space-y-3 border-b border-border/50 pb-4 last:border-0">
                <Item c={c} onReply={user ? () => setReplyTo(replyTo === c.id ? null : c.id) : null} />
                {c.replies?.map((r) => (
                  <Item key={r.id} c={r} isReply onReply={user ? () => setReplyTo(c.id) : null} />
                ))}
                {user && replyTo === c.id && (
                  <div className="ml-4 sm:ml-8">
                    <Composer
                      user={user}
                      autoFocus
                      submitLabel="Balas"
                      placeholder={`Balas ${c.name}...`}
                      onCancel={() => setReplyTo(null)}
                      onSubmit={(v) => post(v, c.id)}
                    />
                  </div>
                )}
              </div>
            ))}
            {hasMore && (
              <button
                onClick={() => load(nextOffset)}
                className="w-full border border-border py-2 text-xs font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
              >
                Muat lebih banyak
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
