export const dynamic = "force-dynamic";

import Link from "next/link";
import MangaCard from "@/components/MangaCard";
import {
  getKomikLatest,
  getKomikPopular,
  getKomikByType,
  getKomikByGenre,
  searchKomik,
} from "@/lib/komik";

export const metadata = {
  title: "Manga & Komik - Anyme",
  description: "Baca manga, manhwa, dan manhua bahasa Indonesia gratis",
};

const TYPES = ["Manga", "Manhwa", "Manhua"];
const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Harem",
  "Historical", "Horror", "Isekai", "Romance", "School Life", "Supernatural",
];

function href({ q, sort, type, genre, page }) {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (sort) p.set("sort", sort);
  if (type) p.set("type", type);
  if (genre) p.set("genre", genre);
  if (page && page > 1) p.set("page", String(page));
  const s = p.toString();
  return s ? `/manga?${s}` : "/manga";
}

const chip = (active) =>
  `text-xs uppercase tracking-wider px-3 py-1.5 border transition-colors ${
    active
      ? "bg-primary text-primary-foreground border-primary"
      : "border-border hover:border-primary hover:text-primary"
  }`;

export default async function MangaPage({ searchParams }) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();
  const sort = sp.sort === "populer" ? "populer" : "";
  const type = TYPES.includes(sp.type) ? sp.type : "";
  const genre = GENRES.includes(sp.genre) ? sp.genre : "";
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);

  let data;
  let heading = "Update Terbaru";
  if (q) {
    data = await searchKomik(q, page);
    heading = `Hasil: "${q}"`;
  } else if (genre) {
    data = await getKomikByGenre(genre, page);
    heading = `Genre: ${genre}`;
  } else if (type) {
    data = await getKomikByType(type, page);
    heading = type;
  } else if (sort === "populer") {
    data = await getKomikPopular(page);
    heading = "Populer";
  } else {
    data = await getKomikLatest(page);
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="industrial-border">
        <h1 className="text-2xl font-bold uppercase tracking-tight">Manga & Komik</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Manga, manhwa, dan manhua sub Indonesia</p>
      </div>

      {/* Search (GET form, tanpa JS) */}
      <form action="/manga" className="flex gap-2 max-w-md">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Cari judul komik..."
          className="flex-1 bg-card border border-border px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
        />
        <button
          type="submit"
          className="bg-primary text-primary-foreground px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors"
        >
          Cari
        </button>
      </form>

      {/* Filter */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Link href="/manga" className={chip(!q && !sort && !type && !genre)}>Terbaru</Link>
          <Link href="/manga?sort=populer" className={chip(sort === "populer" && !q && !type && !genre)}>Populer</Link>
          {TYPES.map((t) => (
            <Link key={t} href={href({ type: t })} className={chip(type === t && !q)}>{t}</Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {GENRES.map((g) => (
            <Link
              key={g}
              href={href({ genre: g })}
              className={`text-[11px] px-2 py-1 border transition-colors ${
                genre === g && !q
                  ? "border-primary text-primary"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {g}
            </Link>
          ))}
        </div>
      </div>

      <div className="industrial-border">
        <h2 className="text-lg font-bold tracking-tight uppercase">{heading}</h2>
      </div>

      {data.items.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center border border-border">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Tidak ada komik ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {data.items.map((m, i) => (
            <MangaCard key={`${m.slug}-${i}`} manga={m} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {(page > 1 || data.hasNext) && (
        <div className="flex items-center justify-center gap-3">
          {page > 1 && (
            <Link href={href({ q, sort, type, genre, page: page - 1 })} className={chip(false)}>← Sebelumnya</Link>
          )}
          <span className="text-xs text-muted-foreground font-mono">Hal {page}</span>
          {data.hasNext && (
            <Link href={href({ q, sort, type, genre, page: page + 1 })} className={chip(false)}>Berikutnya →</Link>
          )}
        </div>
      )}
    </div>
  );
}
