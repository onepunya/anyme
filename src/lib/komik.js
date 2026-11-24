// ============================================================
// Backend komik: SankaVollerei /comic/komikindo
// Override base lewat env KOMIK_API_ROOT (server-side).
//
// Catatan: endpoint latest & search memberi `slug`. Endpoint populer/type/
// filter/list hanya memberi id numerik (/?page=manga&id=123) tanpa slug,
// jadi slug-nya ditebak dari judul (slugify). Kalau tebakan salah, halaman
// detail otomatis fallback mencari lewat search (lihat getKomikDetail).
// ============================================================

const ROOT = (process.env.KOMIK_API_ROOT || "https://www.sankavollerei.web.id/comic/komikindo").replace(/\/+$/, "");

async function request(path, label) {
  const res = await fetch(`${ROOT}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${label} (${res.status})`);
  const json = await res.json();
  if (json && json.success === false) throw new Error(`API error ${label}`);
  return json;
}

async function requestSafe(path, label) {
  try {
    return await request(path, label);
  } catch (e) {
    console.error(`[komik] ${label}:`, e.message);
    return null;
  }
}

// ---------- helpers ----------
export const slugify = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const clean = (s) =>
  String(s || "")
    .replace(/^\s*Komik\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();

const EMPTY = { items: [], page: 1, hasNext: false };

// bentuk "latest" & "search": komikList[{title, slug, image, type, chapters?, rating?}]
function mapSlugList(json, page) {
  const list = json?.komikList || [];
  return {
    items: list.map((k) => ({
      slug: k.slug,
      title: clean(k.title),
      image: k.image || "",
      type: k.type || "",
      score: k.rating || undefined,
      chapter: k.chapters?.[0]?.title || undefined,
      chapterSlug: k.chapters?.[0]?.slug || undefined,
      time: k.chapters?.[0]?.date || undefined,
    })),
    page,
    hasNext: json?.pagination?.hasNextPage ?? list.length > 0,
  };
}

// bentuk "populer", "type", "filter", "list", "colorized": data[{title, url, img, type, score, status, data:{chapter,time}}]
function mapIdList(json, page) {
  const list = json?.data || [];
  return {
    items: list.map((k) => ({
      slug: slugify(k.title),
      title: clean(k.title),
      image: k.img || "",
      type: k.type || "",
      score: k.score || undefined,
      status: k.status || undefined,
      chapter: k.data?.chapter ? `Chapter ${k.data.chapter}` : k.chapter ? `Chapter ${k.chapter}` : undefined,
      time: k.data?.time || undefined,
    })),
    page,
    hasNext: list.length > 0,
  };
}

// ---------- daftar ----------
export async function getKomikLatest(page = 1) {
  const j = await requestSafe(`/latest/${page}`, "komik latest");
  return j ? mapSlugList(j, page) : { ...EMPTY, page };
}

export async function getKomikPopular(page = 1) {
  const j = await requestSafe(`/populer/${page}`, "komik populer");
  return j ? mapIdList(j, page) : { ...EMPTY, page };
}

export async function searchKomik(q, page = 1) {
  const j = await requestSafe(`/search/${encodeURIComponent(q)}/${page}`, "komik search");
  return j ? mapSlugList(j, page) : { ...EMPTY, page };
}

export async function getKomikByType(type, page = 1) {
  const j = await requestSafe(`/type/${encodeURIComponent(type)}/${page}`, "komik type");
  return j ? mapIdList(j, page) : { ...EMPTY, page };
}

export async function getKomikByGenre(genre, page = 1) {
  const j = await requestSafe(`/filter/genres/${encodeURIComponent(genre)}/${page}`, "komik genre");
  return j ? mapIdList(j, page) : { ...EMPTY, page };
}

// ---------- detail ----------
function mapDetail(d, slug) {
  return {
    slug,
    id: d.id,
    title: clean(d.title),
    image: d.image || "",
    rating: d.rating,
    alternativeTitle: d.detail?.alternativeTitle,
    status: d.detail?.status,
    author: d.detail?.author,
    illustrator: d.detail?.illustrator,
    type: d.detail?.type,
    theme: d.detail?.theme,
    genres: (d.genres || []).map((g) => g.name),
    description: String(d.description || "").trim(),
    firstChapter: d.firstChapter?.slug,
    latestChapter: d.latestChapter?.slug,
    chapters: (d.chapters || []).map((c) => ({
      title: String(c.title || "").replace(/\s+/g, " ").trim(),
      slug: c.slug,
      releaseTime: c.releaseTime,
    })),
  };
}

export async function getKomikDetail(slug) {
  let j = await requestSafe(`/detail/${encodeURIComponent(slug)}`, "komik detail");
  let realSlug = slug;

  // slug hasil tebakan dari judul bisa meleset -> cari lewat search
  if (!j?.data) {
    const found = await searchKomik(slug.replace(/-/g, " "));
    const first = found.items[0];
    if (first) {
      realSlug = first.slug;
      j = await requestSafe(`/detail/${encodeURIComponent(first.slug)}`, "komik detail (fallback)");
    }
  }
  if (!j?.data) return null;
  return mapDetail(j.data, realSlug);
}

// ---------- chapter ----------
export async function getKomikChapter(slug) {
  const j = await requestSafe(`/chapter/${encodeURIComponent(slug)}`, "komik chapter");
  const d = j?.data;
  if (!d) return null;
  return {
    id: d.id,
    slug,
    title: clean(d.title),
    prev: d.navigation?.prev || null,
    next: d.navigation?.next || null,
    mangaSlug: d.allChapterSlug || "",
    images: (d.images || []).map((i) => i.url).filter(Boolean),
  };
}
