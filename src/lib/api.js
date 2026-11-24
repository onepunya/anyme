// ============================================================
// Backend: SankaVollerei API — sumber Animasu
// Base URL bisa di-override lewat env ANIME_API_URL (server-side).
//
// File ini adalah ADAPTER: semua fungsi mengembalikan bentuk data
// yang sama seperti API lama (samehadaku), jadi halaman & komponen
// UI tidak perlu diubah. Kalau response API berubah, cukup edit di sini.
// ============================================================

const BASE_URL =
  process.env.ANIME_API_URL || "https://www.sankavollerei.web.id/anime/animasu";

// Endpoint yang BELUM terkonfirmasi dari kode referensi (juju-otaku):
// popular, movies, genres, schedule. Kalau path-nya beda di dokumentasi,
// ganti di sini saja. Kalau gagal, halaman tampil kosong (tidak crash).
const PATHS = {
  ongoing: "/ongoing",
  completed: "/completed",
  detail: (id) => `/detail/${id}`,
  episode: (id) => `/episode/${id}`,
  search: (q) => `/search/${encodeURIComponent(q)}`,
  animelist: (letter, page) => `/animelist?letter=${letter}&page=${page}`,
  batch: (id) => `/batch/${id}`,
  // --- belum terkonfirmasi ---
  popular: (page) => `/popular?page=${page}`,
  movies: (page) => `/movies?page=${page}`,
  genres: () => `/genres`,
  genre: (id, page) => `/genre/${id}?page=${page}`,
  schedule: () => `/schedule`,
};

// ---------- helpers ----------

async function request(path, label) {
  const res = await fetch(`${BASE_URL}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${label} (${res.status})`);
  return res.json();
}

// Untuk endpoint opsional: gagal => null (UI tampil kosong)
async function requestSafe(path, label) {
  try {
    return await request(path, label);
  } catch (e) {
    console.error(`[api] ${label}:`, e.message);
    return null;
  }
}

const EMPTY_LIST = { data: { animeList: [] }, pagination: null };

function stripEpisodeWord(ep) {
  if (!ep) return undefined;
  return String(ep).replace(/^episode\s*/i, "").trim() || undefined;
}

// item list animasu -> item UI anyme
function mapAnimeItem(a, i) {
  return {
    animeId: a.slug,
    title: a.title,
    poster: a.poster || "",
    episodes: stripEpisodeWord(a.episode),
    releasedOn: a.release_day ? String(a.release_day).replace("✓", "").trim() : undefined,
    score: a.score || a.rating || undefined,
    type: a.type,
    rank: i !== undefined ? i + 1 : undefined,
  };
}

function mapList(raw, page, { withRank = false } = {}) {
  const items = raw?.animes || raw?.data?.animes || raw?.results || [];
  const animeList = items.filter((a) => a?.slug).map((a, i) => mapAnimeItem(a, withRank ? i : undefined));

  // pakai pagination dari API kalau ada, kalau tidak buat perkiraan
  const p = raw?.pagination;
  const hasNext = p?.hasNextPage ?? p?.has_next ?? animeList.length > 0;
  const totalPages =
    p?.totalPages ?? p?.total_pages ?? (hasNext ? page + 1 : page);

  return {
    data: { animeList },
    pagination: {
      currentPage: page,
      totalPages,
      hasPrevPage: p?.hasPrevPage ?? page > 1,
      hasNextPage: hasNext,
    },
  };
}

// "one-punch-man-s3-episode-5" -> { base: "one-punch-man-s3", num: 5 }
function parseEpisodeSlug(slug) {
  const m = slug.match(/^(.*)-episode-(\d+)$/);
  if (!m) return null;
  return { base: m[1], num: parseInt(m[2], 10) };
}

// ---------- home / listing ----------

export async function getOngoingAnime(page = 1) {
  const raw = await request(`${PATHS.ongoing}${page > 1 ? `?page=${page}` : ""}`, "ongoing anime");
  return mapList(raw, page);
}

export async function getCompletedAnime(page = 1) {
  const raw = await requestSafe(`${PATHS.completed}${page > 1 ? `?page=${page}` : ""}`, "completed anime");
  return raw ? mapList(raw, page) : EMPTY_LIST;
}

// Dulu: /recent. Animasu tidak punya "recent" yang terkonfirmasi,
// jadi pakai daftar completed untuk section kedua di beranda.
export async function getRecentAnime(page = 1) {
  return getCompletedAnime(page);
}

export async function getHomeData() {
  const [ongoing, completed] = await Promise.all([getOngoingAnime(), getCompletedAnime()]);
  return { ongoing, completed };
}

export async function getTopAnime() {
  const raw = await requestSafe(PATHS.popular(1), "top anime");
  if (!raw) return [];
  return mapList(raw, 1, { withRank: true }).data.animeList.slice(0, 10);
}

export async function getPopularAnime(page = 1) {
  const raw = await requestSafe(PATHS.popular(page), "popular anime");
  return raw ? mapList(raw, page, { withRank: false }) : EMPTY_LIST;
}

export async function getMovieAnime(page = 1) {
  const raw = await requestSafe(PATHS.movies(page), "movie anime");
  return raw ? mapList(raw, page) : EMPTY_LIST;
}

export async function searchAnime(query) {
  const raw = await request(PATHS.search(query), "search");
  return mapList(raw, 1);
}

// A-Z list (belum dipakai UI anyme, tapi tersedia)
export async function getAnimeList(letter = "A", page = 1) {
  const raw = await requestSafe(PATHS.animelist(letter, page), "anime list");
  return raw ? mapList(raw, page) : EMPTY_LIST;
}

// ---------- genres & schedule (belum terkonfirmasi) ----------

export async function getGenres() {
  const raw = await requestSafe(PATHS.genres(), "genres");
  const items = raw?.genres || raw?.data?.genres || raw?.data?.genreList || [];
  return {
    data: {
      genreList: items.map((g) => ({
        genreId: g.slug || g.genreId || g.id,
        title: g.name || g.title,
      })),
    },
  };
}

export async function getAnimeByGenre(genreId, page = 1) {
  const raw = await requestSafe(PATHS.genre(genreId, page), "anime by genre");
  return raw ? mapList(raw, page) : EMPTY_LIST;
}

export async function getSchedule() {
  const raw = await requestSafe(PATHS.schedule(), "schedule");
  // Bentuk yang diharapkan UI: { data: { days: [{ day, animeList }] } }
  const src = raw?.schedule || raw?.days || raw?.data?.days || [];
  const days = Array.isArray(src)
    ? src.map((d) => ({
        day: d.day || d.name,
        animeList: (d.animes || d.animeList || []).filter((a) => a?.slug).map((a) => mapAnimeItem(a)),
      }))
    : Object.entries(src).map(([day, list]) => ({
        day,
        animeList: (list || []).filter((a) => a?.slug).map((a) => mapAnimeItem(a)),
      }));
  return { data: { days } };
}

// ---------- detail ----------

export async function getAnimeDetail(animeId) {
  const raw = await request(PATHS.detail(animeId), "anime detail");
  const d = raw?.detail || raw?.data || raw;
  if (!d || !d.title) throw new Error("Failed to fetch anime detail");

  const episodeList = (d.episodes || [])
    .filter((e) => e?.slug)
    .map((e) => ({
      episodeId: e.slug,
      title: String(e.name || "").replace(/^episode\s*/i, "").trim() || e.name,
    }));

  return {
    data: {
      animeId,
      title: d.title,
      english: undefined,
      japanese: d.synonym || undefined,
      poster: d.poster,
      type: d.type,
      status: d.status,
      season: d.season,
      studios: d.studio,
      score: d.rating || d.score ? { value: d.rating || d.score } : undefined,
      episodes: episodeList.length ? String(episodeList.length) : undefined,
      synopsis: {
        paragraphs: d.synopsis ? [d.synopsis] : [],
        connections: [],
      },
      genreList: (d.genres || []).map((g) => ({ genreId: g.slug, title: g.name })),
      batchList: d.batch?.slug ? [{ batchId: d.batch.slug, title: d.batch.name || `${d.title} Batch` }] : [],
      episodeList,
      // data tambahan, dipakai halaman episode
      _meta: { releasedOn: d.aired, duration: d.duration },
    },
  };
}

// ---------- episode ----------

async function episodeExists(slug) {
  try {
    const res = await fetch(`${BASE_URL}${PATHS.episode(slug)}`, { method: "HEAD", cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getEpisodeDetail(episodeId) {
  const raw = await request(PATHS.episode(episodeId), "episode detail");
  const streams = (raw?.streams || []).filter((s) => s?.url);

  const parsed = parseEpisodeSlug(episodeId);
  const animeId = parsed?.base;

  // Ambil info anime (poster, genre, sinopsis, daftar episode) + cek prev/next
  const prevSlug = parsed && parsed.num > 1 ? `${parsed.base}-episode-${parsed.num - 1}` : null;
  const nextSlug = parsed ? `${parsed.base}-episode-${parsed.num + 1}` : null;

  const [animeRes, hasPrev, hasNext] = await Promise.all([
    animeId ? getAnimeDetail(animeId).catch(() => null) : null,
    prevSlug ? episodeExists(prevSlug) : false,
    nextSlug ? episodeExists(nextSlug) : false,
  ]);
  const anime = animeRes?.data;

  return {
    data: {
      title: raw?.title || episodeId,
      animeId,
      poster: anime?.poster,
      releasedOn: anime?._meta?.releasedOn,
      genreList: anime?.genreList || [],
      synopsis: anime?.synopsis,
      defaultStreamingUrl: streams[0]?.url || "",
      // satu "kualitas" berisi semua server; url langsung ikut disertakan
      server: {
        qualities: [
          {
            title: "Server",
            serverList: streams.map((s, i) => ({
              title: s.name || `Server ${i + 1}`,
              serverId: `${episodeId}~${i}`,
              url: s.url,
            })),
          },
        ],
      },
      hasPrevEpisode: hasPrev,
      prevEpisode: hasPrev ? { episodeId: prevSlug } : null,
      hasNextEpisode: hasNext,
      nextEpisode: hasNext ? { episodeId: nextSlug } : null,
      recommendedEpisodeList: (anime?.episodeList || []).map((e) => ({
        episodeId: e.episodeId,
        title: `${anime.title} Episode ${e.title}`,
        poster: anime.poster,
        releaseDate: "",
      })),
    },
  };
}

// serverId format: "<episodeId>~<index>" (lihat getEpisodeDetail)
export async function getServerUrl(serverId) {
  const [episodeId, idx] = String(serverId).split("~");
  const raw = await request(PATHS.episode(episodeId), "server URL");
  const streams = (raw?.streams || []).filter((s) => s?.url);
  const url = streams[parseInt(idx, 10) || 0]?.url || "";
  return { data: { url } };
}

// ---------- batch ----------

export async function getBatchDetail(batchId) {
  const raw = await request(PATHS.batch(batchId), "batch detail");
  const b = raw?.data || raw;
  return {
    data: {
      title: b.title,
      animeId: batchId.replace(/-batch.*$/, ""),
      poster: b.poster,
      synopsis: b.synopsis ? { paragraphs: [b.synopsis] } : undefined,
      downloadUrl: b.downloadUrl || { formats: [] },
    },
  };
}
