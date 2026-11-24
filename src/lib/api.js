// ============================================================
// Backend: SankaVollerei API — beberapa sumber DIGABUNG (mix)
//
//  MAIN   /anime/*          (otakudesu) -> ongoing, jadwal, detail lengkap,
//                                           episode + kualitas, batch
//  STREAM /anime/stream/*   (anime-indo) -> latest, popular, search, movie,
//                                           genre, daftar A-Z
//  WINBU  /anime/winbu/*    -> kualitas 360p-1080p untuk episode STREAM
//
// Slug tiap sumber berbeda, jadi id dari sumber STREAM diberi awalan
// "st~" (mis. "st~one-piece"). Id tanpa awalan = sumber MAIN.
// Fungsi di bawah mengembalikan bentuk data yang dibaca UI anyme,
// jadi halaman & komponen hampir tidak perlu diubah.
// Override base lewat env ANIME_API_ROOT (server-side).
// ============================================================

const ROOT = (process.env.ANIME_API_ROOT || "https://www.sankavollerei.web.id/anime").replace(/\/+$/, "");
const STREAM = `${ROOT}/stream`;
const WINBU = `${ROOT}/winbu`;

const ST = "st~"; // awalan id sumber STREAM
const WB = "wb~"; // awalan serverId sumber WINBU

// ---------- http ----------

async function request(url, label) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${label} (${res.status})`);
  return res.json();
}

// Untuk daftar/opsional: gagal => null (UI tampil kosong, tidak crash)
async function requestSafe(url, label) {
  try {
    return await request(url, label);
  } catch (e) {
    console.error(`[api] ${label}:`, e.message);
    return null;
  }
}

// ---------- helpers ----------

const isStreamId = (id) => String(id || "").startsWith(ST);
const stripSt = (id) => String(id || "").replace(/^st~/, "");

const EMPTY_LIST = {
  data: { animeList: [] },
  pagination: { currentPage: 1, totalPages: 1, hasPrevPage: false, hasNextPage: false },
};

const slugify = (s) =>
  String(s || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// "one-piece-episode-1000" -> "one-piece"
function animeSlugFromEpisode(slug) {
  return String(slug || "").replace(/-episode-\d+(-.*)?$/, "");
}

function cleanEpisodeTitle(t) {
  const s = String(t || "").replace(/^episode\s*/i, "").trim();
  return /^\d+$/.test(s) ? String(parseInt(s, 10)) : s || String(t || "");
}

function toSlug(v) {
  if (!v) return "";
  return String(v).split("?")[0].replace(/\/+$/, "").split("/").pop();
}

function buildPagination(page, count, hasMore) {
  const hasNext = hasMore ?? count > 0;
  return {
    currentPage: page,
    totalPages: hasNext ? page + 1 : page,
    hasPrevPage: page > 1,
    hasNextPage: hasNext,
  };
}

const paragraphs = (v) =>
  v ? String(v).split(/\n+/).map((x) => x.trim()).filter(Boolean) : [];

// ambil URL embed dari response server yang bentuknya belum pasti
function extractUrl(raw) {
  if (!raw) return "";
  if (typeof raw === "string") {
    const m = raw.match(/src=["']([^"']+)["']/i);
    if (m) return m[1];
    return /^https?:\/\//.test(raw) ? raw : "";
  }
  const direct = raw?.data?.url || raw?.url || raw?.data?.embed || raw?.embed;
  if (typeof direct === "string" && direct) return extractUrl(direct) || direct;
  let found = "";
  const walk = (o, depth = 0) => {
    if (found || !o || typeof o !== "object" || depth > 4) return;
    for (const [k, v] of Object.entries(o)) {
      if (typeof v === "string" && /url|embed|iframe|src|link|html/i.test(k)) {
        const u = extractUrl(v);
        if (u) { found = u; return; }
      } else if (v && typeof v === "object") walk(v, depth + 1);
    }
  };
  walk(raw);
  return found;
}

// ============================================================
// MAIN (otakudesu) — bentuk datanya sudah hampir sama dengan UI
// ============================================================

function mapMainItem(a) {
  return {
    animeId: a.animeId,
    title: a.title,
    poster: a.poster || "",
    episodes: a.episodes != null ? String(a.episodes) : undefined,
    releasedOn: a.latestReleaseDate || a.releaseDay || undefined,
    score: a.score || undefined,
  };
}

function mainList(raw, page) {
  const items = raw?.data?.animeList || [];
  const animeList = items.filter((a) => a?.animeId).map(mapMainItem);
  const p = raw?.pagination;
  return {
    data: { animeList },
    pagination: p
      ? {
          currentPage: p.currentPage ?? page,
          totalPages: p.totalPages ?? page,
          hasPrevPage: !!p.hasPrevPage,
          hasNextPage: !!p.hasNextPage,
        }
      : buildPagination(page, animeList.length),
  };
}

async function mainAnimeDetail(animeId) {
  const raw = await request(`${ROOT}/anime/${animeId}`, "anime detail");
  const d = raw?.data;
  if (!d || !d.title) throw new Error("Failed to parse anime detail");

  const batchSrc = d.batch;
  const batchId = batchSrc ? batchSrc.batchId || toSlug(batchSrc.href) || (typeof batchSrc === "string" ? batchSrc : "") : "";

  return {
    data: {
      animeId,
      title: d.title,
      japanese: d.japanese || undefined,
      poster: d.poster || "",
      type: d.type,
      status: d.status,
      season: d.season,
      studios: d.studios,
      score: d.score ? { value: d.score } : undefined,
      episodes: d.episodes ? String(d.episodes) : undefined,
      synopsis: {
        paragraphs: d.synopsis?.paragraphs || [],
        connections: d.synopsis?.connections || [],
      },
      genreList: d.genreList || [],
      batchList: batchId ? [{ batchId, title: batchSrc.title || `${d.title} Batch` }] : [],
      episodeList: (d.episodeList || [])
        .filter((e) => e?.episodeId)
        .map((e) => ({
          episodeId: e.episodeId,
          title: e.eps != null ? String(e.eps) : cleanEpisodeTitle(e.title),
          date: e.date || "",
        })),
    },
  };
}

async function mainEpisodeDetail(episodeId) {
  const raw = await request(`${ROOT}/episode/${episodeId}`, "episode detail");
  const d = raw?.data;
  if (!d) throw new Error("Failed to parse episode detail");

  const anime = d.animeId ? await mainAnimeDetail(d.animeId).then((r) => r.data).catch(() => null) : null;

  const qualities = (d.server?.qualities || []).map((q) => ({
    title: q.title,
    serverList: (q.serverList || []).map((s) => ({ ...s, title: String(s.title || "").trim() })),
  }));

  const dlQualities = d.downloadUrl?.qualities || [];

  return {
    data: {
      title: d.title,
      animeId: d.animeId,
      poster: anime?.poster,
      releasedOn: d.releaseTime,
      genreList: d.info?.genreList || anime?.genreList || [],
      synopsis: d.synopsis?.paragraphs ? d.synopsis : anime?.synopsis,
      defaultStreamingUrl: d.defaultStreamingUrl || "",
      server: { qualities },
      downloadUrl: dlQualities.length ? { formats: [{ title: "Download", qualities: dlQualities }] } : d.downloadUrl,
      hasPrevEpisode: !!d.hasPrevEpisode,
      prevEpisode: d.prevEpisode || null,
      hasNextEpisode: !!d.hasNextEpisode,
      nextEpisode: d.nextEpisode || null,
      recommendedEpisodeList: windowEpisodes(anime, episodeId),
    },
  };
}

// ============================================================
// STREAM (anime-indo) — semua id diberi awalan "st~"
// ============================================================

function streamList(raw, page, opts = {}) {
  const items = Array.isArray(raw?.data) ? raw.data : [];
  const seen = new Set();
  const animeList = [];
  items.forEach((a, i) => {
    if (!a?.slug) return;
    const slug = opts.fromEpisode ? animeSlugFromEpisode(a.slug) : a.slug;
    if (seen.has(slug)) return;
    seen.add(slug);
    animeList.push({
      animeId: ST + slug,
      title: a.title,
      poster: a.poster || "",
      episodes: a.episode ? String(a.episode) : undefined,
      releasedOn: a.type || undefined,
      rank: opts.withRank ? i + 1 : undefined,
    });
  });
  return {
    data: { animeList },
    pagination: buildPagination(page, animeList.length, opts.singlePage ? false : undefined),
  };
}

async function streamAnimeDetail(animeId) {
  const slug = stripSt(animeId);
  const raw = await request(`${STREAM}/anime/${slug}`, "anime detail");
  const d = raw?.data;
  if (!d || !d.title) {
    const keys = raw && typeof raw === "object" ? Object.keys(raw).join(",") : typeof raw;
    throw new Error(`Failed to parse anime detail (keys: ${keys})`);
  }
  const episodeList = (d.episodes || [])
    .filter((e) => e?.eps_slug)
    .map((e) => ({ episodeId: ST + e.eps_slug, title: cleanEpisodeTitle(e.eps_title), date: "" }));

  return {
    data: {
      animeId: ST + slug,
      title: d.title,
      poster: d.poster || "",
      episodes: episodeList.length ? String(episodeList.length) : undefined,
      synopsis: { paragraphs: paragraphs(d.synopsis), connections: [] },
      genreList: (d.genres || [])
        .map((g) => String(g).trim())
        .filter(Boolean)
        .map((g) => ({ genreId: slugify(g), title: g })),
      batchList: [],
      episodeList,
    },
  };
}

const RES_ORDER = ["360p", "480p", "720p", "1080p"];
const SERVER_PRIORITY = ["blogspot", "vidhide", "pixel", "kraken", "mega"];
const serverRank = (name) => {
  const i = SERVER_PRIORITY.indexOf(String(name).toLowerCase());
  return i === -1 ? 99 : i;
};

// kualitas dari WINBU: [{resolution, server, data:{post,nume,type}}] -> qualities
function winbuQualities(streams) {
  const groups = new Map();
  for (const s of streams || []) {
    if (!s?.resolution || !s?.data) continue;
    if (!groups.has(s.resolution)) groups.set(s.resolution, []);
    groups.get(s.resolution).push({
      title: s.server,
      serverId: `${WB}${s.data.post}~${s.data.nume}~${s.data.type}`,
    });
  }
  return [...groups.entries()]
    .sort((a, b) => {
      const ia = RES_ORDER.indexOf(a[0]), ib = RES_ORDER.indexOf(b[0]);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    })
    .map(([title, list]) => ({
      title,
      serverList: list.sort((x, y) => serverRank(x.title) - serverRank(y.title)),
    }));
}

async function streamEpisodeDetail(episodeId) {
  const slug = stripSt(episodeId);

  // winbu dicoba dengan slug yang sama; kalau tidak ada, pakai server bawaan saja
  const [raw, winbu] = await Promise.all([
    request(`${STREAM}/episode/${slug}`, "episode detail"),
    requestSafe(`${WINBU}/episode/${slug}`, "winbu episode"),
  ]);
  const d = raw?.data;
  if (!d) throw new Error("Failed to parse episode detail");

  const animeId = ST + animeSlugFromEpisode(slug);
  const anime = await streamAnimeDetail(animeId).then((r) => r.data).catch(() => null);

  const streams = (d.stream_links || []).filter((s) => s?.url);
  const wq = winbuQualities(winbu?.data?.streams);

  const qualities = [...wq];
  if (streams.length) {
    qualities.push({
      title: wq.length ? "Alt" : "Server",
      serverList: streams.map((s, i) => ({
        title: s.server || `Server ${i + 1}`,
        serverId: `${episodeId}~${i}`,
        url: s.url,
      })),
    });
  }

  // download: utamakan winbu (per resolusi), kalau tidak ada pakai bawaan stream
  const wDownloads = (winbu?.data?.downloads || []).filter((x) => x?.links?.length);
  const sDownloads = (d.download_links || []).filter((l) => l?.url);
  let downloadUrl;
  if (wDownloads.length) {
    downloadUrl = {
      formats: [
        {
          title: "Download",
          qualities: wDownloads.map((x) => ({
            title: x.resolution,
            urls: x.links.map((l) => ({ title: l.server, url: l.url })),
          })),
        },
      ],
    };
  } else if (sDownloads.length) {
    downloadUrl = {
      formats: [
        { title: "Download", qualities: [{ title: "Links", urls: sDownloads.map((l) => ({ title: l.server || "Download", url: l.url })) }] },
      ],
    };
  }

  return {
    data: {
      title: d.title || slug,
      animeId,
      poster: d.poster || anime?.poster,
      genreList: anime?.genreList || [],
      synopsis: d.synopsis ? { paragraphs: paragraphs(d.synopsis) } : anime?.synopsis,
      defaultStreamingUrl: streams[0]?.url || "",
      server: { qualities },
      downloadUrl,
      hasPrevEpisode: !!d.prev_slug,
      prevEpisode: d.prev_slug ? { episodeId: ST + d.prev_slug } : null,
      hasNextEpisode: !!d.next_slug,
      nextEpisode: d.next_slug ? { episodeId: ST + d.next_slug } : null,
      recommendedEpisodeList: windowEpisodes(anime, episodeId),
    },
  };
}

// panel "Other Episodes": ambil ±40 episode di sekitar episode aktif
function windowEpisodes(anime, episodeId) {
  if (!anime?.episodeList?.length) return [];
  const idx = anime.episodeList.findIndex((e) => e.episodeId === episodeId);
  const start = Math.max(0, (idx === -1 ? 0 : idx) - 15);
  return anime.episodeList.slice(start, start + 40).map((e) => ({
    episodeId: e.episodeId,
    title: `${anime.title} Episode ${e.title}`,
    poster: anime.poster,
    releaseDate: e.date || "",
  }));
}

// ============================================================
// API publik (dipakai halaman & route)
// ============================================================

// ---- listing ----

// Ongoing: sumber MAIN (ada hari rilis + pagination). Kalau gagal, pakai latest STREAM.
export async function getOngoingAnime(page = 1) {
  const raw = await requestSafe(`${ROOT}/ongoing-anime?page=${page}`, "ongoing anime");
  if (raw?.data?.animeList) return mainList(raw, page);
  // fallback hanya untuk halaman 1 supaya sumber tidak tercampur antar halaman
  return page === 1 ? getRecentAnime(1) : EMPTY_LIST;
}

// Episode terbaru (STREAM)
export async function getRecentAnime(page = 1) {
  const path = page > 1 ? `/latest/${page}` : `/latest`;
  const raw = await requestSafe(`${STREAM}${path}`, "latest anime");
  return raw ? streamList(raw, page, { fromEpisode: true }) : EMPTY_LIST;
}

export async function getTopAnime() {
  const raw = await requestSafe(`${STREAM}/popular`, "popular anime");
  if (!raw) return [];
  return streamList(raw, 1, { withRank: true }).data.animeList.slice(0, 10);
}

export async function getPopularAnime(page = 1) {
  if (page > 1) return { ...EMPTY_LIST, pagination: buildPagination(page, 0, false) };
  const raw = await requestSafe(`${STREAM}/popular`, "popular anime");
  return raw ? streamList(raw, 1, { singlePage: true }) : EMPTY_LIST;
}

export async function getMovieAnime(page = 1) {
  const raw = await requestSafe(`${STREAM}/movie/${page}`, "movie anime");
  return raw ? streamList(raw, page) : EMPTY_LIST;
}

export async function searchAnime(query) {
  const raw = await request(`${STREAM}/search/${encodeURIComponent(query)}`, "search");
  return streamList(raw, 1, { singlePage: true });
}

// Daftar A-Z (tersedia, belum dipakai UI)
export async function getAnimeList() {
  const raw = await requestSafe(`${STREAM}/list`, "anime list");
  return raw ? streamList(raw, 1, { singlePage: true }) : EMPTY_LIST;
}

// ---- jadwal (MAIN) ----

export async function getSchedule() {
  const raw = await requestSafe(`${ROOT}/schedule`, "schedule");
  const src = Array.isArray(raw?.data) ? raw.data : [];
  return {
    data: {
      days: src.map((d) => ({
        day: d.day,
        animeList: (d.anime_list || [])
          .filter((a) => a?.slug)
          .map((a) => ({ animeId: a.slug, title: a.title, poster: a.poster || "" })),
      })),
    },
  };
}

// ---- genre (STREAM) ----

export async function getGenres() {
  const raw = await requestSafe(`${STREAM}/genres`, "genres");
  const items = Array.isArray(raw?.data) ? raw.data : [];
  return { data: { genreList: items.map((g) => ({ genreId: g.slug, title: g.title })) } };
}

export async function getAnimeByGenre(genreId, page = 1) {
  const raw = await requestSafe(`${STREAM}/genres/${genreId}/${page}`, "anime by genre");
  return raw ? streamList(raw, page) : EMPTY_LIST;
}

// ---- detail / episode ----

export async function getAnimeDetail(animeId) {
  return isStreamId(animeId) ? streamAnimeDetail(animeId) : mainAnimeDetail(animeId);
}

export async function getEpisodeDetail(episodeId) {
  return isStreamId(episodeId) ? streamEpisodeDetail(episodeId) : mainEpisodeDetail(episodeId);
}

// serverId: "wb~post~nume~type" (WINBU) | "st~slug~idx" (STREAM, inline) | selain itu (MAIN)
export async function getServerUrl(serverId) {
  const id = String(serverId);

  if (id.startsWith(WB)) {
    const [post, nume, type] = id.slice(WB.length).split("~");
    const qs = new URLSearchParams({ post, nume, type }).toString();
    const raw = await request(`${WINBU}/server?${qs}`, "server URL");
    return { data: { url: extractUrl(raw) } };
  }

  if (id.startsWith(ST)) {
    const [episodeSlug, idx] = id.slice(ST.length).split("~");
    const raw = await request(`${STREAM}/episode/${episodeSlug}`, "server URL");
    const streams = (raw?.data?.stream_links || []).filter((s) => s?.url);
    return { data: { url: streams[parseInt(idx, 10) || 0]?.url || "" } };
  }

  const raw = await request(`${ROOT}/server/${id}`, "server URL");
  return { data: { url: extractUrl(raw) } };
}

// ---- batch (MAIN) ----

export async function getBatchDetail(batchId) {
  const raw = await request(`${ROOT}/batch/${batchId}`, "batch detail");
  const d = raw?.data;
  if (!d) throw new Error("Failed to parse batch detail");
  return { data: d };
}
