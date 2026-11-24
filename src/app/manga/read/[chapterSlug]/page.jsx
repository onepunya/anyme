export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { getKomikChapter } from "@/lib/komik";
import Comments from "@/components/Comments";
import ReadTracker from "@/components/ReadTracker";
import { shareMeta } from "@/lib/site";

export async function generateMetadata({ params }) {
  const { chapterSlug } = await params;
  const c = await getKomikChapter(chapterSlug);
  return shareMeta({
    title: `${c?.title || "Baca Komik"} - Anyme`,
    description: "Baca chapter ini gratis di Anyme",
    image: c?.images?.[0],
  });
}

function Nav({ c }) {
  const btn =
    "flex-1 text-center px-3 py-2.5 text-xs font-bold uppercase tracking-widest border transition-colors";
  const on = "border-border hover:border-primary hover:text-primary";
  const off = "border-border/40 text-muted-foreground/40 pointer-events-none";
  return (
    <div className="flex items-center gap-2">
      <Link href={c.prev ? `/manga/read/${c.prev}` : "#"} className={`${btn} ${c.prev ? on : off}`}>
        ← Prev
      </Link>
      {c.mangaSlug && (
        <Link href={`/manga/${c.mangaSlug}`} className={`${btn} ${on}`}>
          Daftar
        </Link>
      )}
      <Link href={c.next ? `/manga/read/${c.next}` : "#"} className={`${btn} ${c.next ? on : off}`}>
        Next →
      </Link>
    </div>
  );
}

export default async function ReadPage({ params }) {
  const { chapterSlug } = await params;
  const c = await getKomikChapter(chapterSlug);
  if (!c) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-4 pb-10">
      <ReadTracker chapterSlug={c.slug} chapterTitle={c.title} mangaSlug={c.mangaSlug} />
      <div className="industrial-border">
        <h1 className="text-lg md:text-xl font-bold tracking-tight uppercase">{c.title}</h1>
      </div>

      <Nav c={c} />

      {/* Halaman dirapatkan tanpa jarak supaya terbaca seperti webtoon */}
      <div className="flex flex-col items-center bg-black">
        {c.images.length === 0 && (
          <p className="p-8 text-sm text-muted-foreground">Gambar chapter tidak tersedia.</p>
        )}
        {c.images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={src}
            alt={`Halaman ${i + 1}`}
            loading={i < 2 ? "eager" : "lazy"}
            referrerPolicy="no-referrer"
            className="w-full h-auto block"
          />
        ))}
      </div>

      <Nav c={c} />

      <Comments threadKey={`chapter:${c.slug}`} title="Diskusi Chapter" />
    </div>
  );
}
