export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { getKomikDetail } from "@/lib/komik";
import Comments from "@/components/Comments";
import { shareMeta } from "@/lib/site";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const m = await getKomikDetail(slug);
  return shareMeta({
    title: `${m?.title || "Komik"} - Anyme`,
    description: m?.description || "Baca komik sub Indonesia gratis",
    image: m?.image,
  });
}

function Stat({ label, value }) {
  if (!value) return null;
  return (
    <div className="bg-card border border-border p-3">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="font-bold mt-1 text-sm break-words">{value}</p>
    </div>
  );
}

export default async function MangaDetailPage({ params }) {
  const { slug } = await params;
  const m = await getKomikDetail(slug);
  if (!m) notFound();

  return (
    <div className="space-y-8 pb-10">
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <div className="relative w-[160px] h-[240px] mx-auto md:mx-0 md:w-full md:h-[320px] overflow-hidden border-2 border-border bg-muted">
          {m.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={m.image}
              alt={m.title}
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
        </div>

        <div className="space-y-5">
          <div className="industrial-border">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight uppercase">{m.title}</h1>
            {m.alternativeTitle && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{m.alternativeTitle}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {m.genres.map((g) => (
              <Link
                key={g}
                href={`/manga?genre=${encodeURIComponent(g)}`}
                className="text-xs uppercase tracking-wider px-2 py-1 border border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {g}
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Stat label="Rating" value={m.rating ? `⭐ ${m.rating}` : ""} />
            <Stat label="Status" value={m.status} />
            <Stat label="Tipe" value={m.type} />
            <Stat label="Pengarang" value={m.author} />
            <Stat label="Ilustrator" value={m.illustrator} />
            <Stat label="Tema" value={m.theme} />
          </div>

          <div className="flex flex-wrap gap-2">
            {m.firstChapter && (
              <Link
                href={`/manga/read/${m.firstChapter}`}
                className="bg-primary text-primary-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors glow-hover"
              >
                Mulai Baca
              </Link>
            )}
            {m.latestChapter && (
              <Link
                href={`/manga/read/${m.latestChapter}`}
                className="border border-border px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
              >
                Chapter Terbaru
              </Link>
            )}
          </div>

          {m.description && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Sinopsis</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{m.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Daftar chapter */}
      <div>
        <div className="industrial-border mb-4">
          <h2 className="text-lg font-bold uppercase tracking-tight">Daftar Chapter</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{m.chapters.length} chapter</p>
        </div>
        <div className="border border-border bg-card max-h-[520px] overflow-y-auto divide-y divide-border/50">
          {m.chapters.length === 0 && (
            <p className="p-4 text-xs text-muted-foreground">Belum ada chapter.</p>
          )}
          {m.chapters.map((c) => (
            <Link
              key={c.slug}
              href={`/manga/read/${c.slug}`}
              className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <span className="font-bold">{c.title}</span>
              <span className="opacity-70 shrink-0">{c.releaseTime}</span>
            </Link>
          ))}
        </div>
      </div>

      <Comments threadKey={`manga:${m.slug}`} title="Diskusi Komik" />
    </div>
  );
}
