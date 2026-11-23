/**
 * Otakudesu scraper (primary source – Sub Indo)
 * Phase 1: search, ongoing, popular/home
 * Phase 2: anime detail + episode list
 */

import { fetchHtml, getBase } from "./fetch.js";

function cleanText(s = "") {
  return String(s || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
}

function slugFromUrl(href = "") {
  const m = String(href).match(/\/anime\/([^/]+)\/?/);
  if (m) return m[1];
  const ep = String(href).match(/\/episode\/([^/]+)\/?/);
  if (ep) return ep[1];
  return String(href).replace(/https?:\/\/[^/]+/, "").replace(/^\/|\/$/g, "");
}

function absUrl(href) {
  if (!href) return "";
  if (href.startsWith("http")) return href;
  const base = getBase().replace(/\/$/, "");
  return href.startsWith("/") ? base + href : base + "/" + href;
}

/** Encode episode id so /episode/[id] can resolve later */
export function encodeEpisodeId(animeSlug, epNum, epUrl = "") {
  const slugPart = encodeURIComponent(animeSlug || "");
  const urlPart = epUrl ? encodeURIComponent(epUrl) : "";
  return `otaku-${slugPart}-ep-${epNum}${urlPart ? "-" + urlPart : ""}`;
}

export function decodeEpisodeId(episodeId) {
  const raw = String(episodeId || "");
  const m = raw.match(/^otaku-(.+)-ep-(\d+)(?:-(.+))?$/);
  if (!m) return null;
  return {
    animeSlug: decodeURIComponent(m[1]),
    ep: Number(m[2]),
    epUrl: m[3] ? decodeURIComponent(m[3]) : null,
  };
}

// ---------- list parsers (Phase 1) ----------

function parseCards(html, limit = 24) {
  const results = [];
  const seen = new Set();

  const classicRe =
    /<a class="ot-k"\s+href="([^"]+)">[\s\S]*?<img[^>]*src="([^"]+)"[\s\S]*?<h2 class="ot-k-j">([^<]+)<\/h2>/gi;
  let m;
  while ((m = classicRe.exec(html)) !== null && results.length < limit) {
    const href = m[1];
    const poster = m[2];
    const title = cleanText(m[3]);
    const id = slugFromUrl(href);
    if (seen.has(id)) continue;
    seen.add(id);
    results.push({ title, url: absUrl(href), id, poster });
  }

  if (results.length >= limit) return results;

  const wpRe = /<h2>\s*<a href="([^"]*\/anime\/[^"]+)"[^>]*>([^<]+)<\/a>\s*<\/h2>/gi;
  while ((m = wpRe.exec(html)) !== null && results.length < limit) {
    const href = m[1];
    const title = cleanText(m[2]);
    const id = slugFromUrl(href);
    if (seen.has(id)) continue;
    const start = Math.max(0, m.index - 1500);
    const chunk = html.slice(start, m.index);
    const imgs = [...chunk.matchAll(/<img[^>]*src="([^"]+)"/gi)];
    const poster = imgs.length ? imgs[imgs.length - 1][1] : "";
    seen.add(id);
    results.push({ title, url: absUrl(href), id, poster });
  }

  if (results.length === 0) {
    const looseRe =
      /href="([^"]*\/anime\/[^"/]+\/?)"[^>]*>[\s\S]*?(?:title="([^"]+)"|>([^<]{3,80})</gi;
    while ((m = looseRe.exec(html)) !== null && results.length < limit) {
      const href = m[1];
      const title = cleanText(m[2] || m[3] || "");
      if (!title || title.length < 2) continue;
      const id = slugFromUrl(href);
      if (seen.has(id)) continue;
      seen.add(id);
      results.push({ title, url: absUrl(href), id, poster: "" });
    }
  }

  return results;
}

export async function search(query, limit = 24) {
  const clean = String(query || "")
    .replace(/[^\w\s-]/gi, "")
    .trim();
  if (!clean) return [];
  const path = `/?s=${encodeURIComponent(clean)}&post_type=anime`;
  const html = await fetchHtml(path);
  return parseCards(html, limit);
}

export async function getOngoing(page = 1) {
  const paths = [
    page > 1 ? `/ongoing/page/${page}/` : `/ongoing/`,
    page > 1 ? `/ongoing-anime/page/${page}/` : `/ongoing-anime/`,
    `/`,
  ];
  let lastErr = null;
  for (const path of paths) {
    try {
      const html = await fetchHtml(path);
      const cards = parseCards(html, 30);
      if (cards.length) return cards;
    } catch (e) {
      lastErr = e;
    }
  }
  if (lastErr) throw lastErr;
  return [];
}

export async function getPopular(page = 1) {
  const paths = [
    page > 1 ? `/complete/page/${page}/` : `/complete/`,
    page > 1 ? `/complete-anime/page/${page}/` : `/complete-anime/`,
    page > 1 ? `/popular/page/${page}/` : `/popular/`,
    `/`,
  ];
  let lastErr = null;
  for (const path of paths) {
    try {
      const html = await fetchHtml(path);
      const cards = parseCards(html, 30);
      if (cards.length) return cards;
    } catch (e) {
      lastErr = e;
    }
  }
  if (lastErr) throw lastErr;
  return [];
}

export async function getHome() {
  const html = await fetchHtml("/");
  const cards = parseCards(html, 40);
  return {
    ongoing: cards.slice(0, 18),
    recent: cards.slice(0, 18),
    top: cards.slice(0, 10).map((c, i) => ({ ...c, rank: i + 1 })),
  };
}

// ---------- Phase 2: detail + episodes ----------

/**
 * Parse infozingle / meta table (Otakudesu classic + WP theme).
 */
function parseInfo(html) {
  const info = {
    title: "",
    japanese: "",
    score: "",
    status: "",
    type: "",
    episodes: "",
    season: "",
    studios: "",
    duration: "",
    released: "",
    genres: [],
    synopsis: "",
    poster: "",
  };

  // Title
  const titleM =
    html.match(/<h1[^>]*class="[^"]*jdlrx[^"]*"[^>]*>([^<]+)</i) ||
    html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
    html.match(/<title>([^|<]+)/i);
  if (titleM) info.title = cleanText(titleM[1].replace(/\s*Subtitle\s*Indonesia.*/i, ""));

  // Poster
  const posterM =
    html.match(/<img[^>]*class="[^"]*attachment[^"]*"[^>]*src="([^"]+)"/i) ||
    html.match(/<div[^>]*class="[^"]*fotoanime[^"]*"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"/i) ||
    html.match(/<img[^>]*src="([^"]+)"[^>]*class="[^"]*wp-post-image/i) ||
    html.match(/property="og:image"\s+content="([^"]+)"/i);
  if (posterM) info.poster = posterM[1];

  // Key-value rows: <b>Status:</b> Ongoing | <span>Status</span> Ongoing | td pairs
  const kvPatterns = [
    /(?:Judul|Title)\s*[:：]?\s*<\/?(?:b|strong|span|td)[^>]*>\s*([^<]+)/gi,
    /Japanese\s*[:：]?\s*<\/?(?:b|strong|span|td)[^>]*>\s*([^<]+)/gi,
    /Skor|Score\s*[:：]?\s*<\/?(?:b|strong|span|td)[^>]*>\s*([^<]+)/gi,
    /Status\s*[:：]?\s*<\/?(?:b|strong|span|td)[^>]*>\s*([^<]+)/gi,
    /Tipe|Type\s*[:：]?\s*<\/?(?:b|strong|span|td)[^>]*>\s*([^<]+)/gi,
    /Episode(?:s)?\s*[:：]?\s*<\/?(?:b|strong|span|td)[^>]*>\s*([^<]+)/gi,
    /Studio\s*[:：]?\s*<\/?(?:b|strong|span|td)[^>]*>\s*([^<]+)/gi,
    /Durasi|Duration\s*[:：]?\s*<\/?(?:b|strong|span|td)[^>]*>\s*([^<]+)/gi,
    /Rilis|Released?\s*[:：]?\s*<\/?(?:b|strong|span|td)[^>]*>\s*([^<]+)/gi,
  ];

  // Broader: label in <b> or <th> then value
  const rowRe =
    /<(?:b|strong|th|span)[^>]*>\s*(Judul|Title|Japanese|Skor|Score|Producer|Status|Tipe|Type|Total\s*Episode|Episode|Durasi|Duration|Tanggal\s*Rilis|Released?|Studio|Season|Genre)s?\s*:?\s*<\/(?:b|strong|th|span)>\s*(?:<\/td>\s*<td[^>]*>)?\s*([^<]+)/gi;
  let rm;
  while ((rm = rowRe.exec(html)) !== null) {
    const key = rm[1].toLowerCase();
    const val = cleanText(rm[2]);
    if (!val) continue;
    if (key.includes("japanese")) info.japanese = val;
    else if (key.includes("skor") || key.includes("score")) info.score = val.replace(/[^0-9.]/g, "");
    else if (key.includes("status")) info.status = val;
    else if (key.includes("tipe") || key === "type") info.type = val;
    else if (key.includes("episode")) info.episodes = val.replace(/[^0-9?]/g, "") || val;
    else if (key.includes("studio") || key.includes("producer")) info.studios = val;
    else if (key.includes("durasi") || key.includes("duration")) info.duration = val;
    else if (key.includes("rilis") || key.includes("release")) info.released = val;
    else if (key.includes("season")) info.season = val;
    else if (key.includes("judul") || key === "title") {
      if (!info.title) info.title = val;
    }
  }

  // Genres – links under genre
  const genreBlock =
    html.match(/Genre(?:s)?\s*:?\s*([\s\S]{0,800}?)<\/(?:div|p|span|td|li)>/i) ||
    html.match(/class="[^"]*genre[^"]*"[^>]*>([\s\S]{0,800}?)<\//i);
  if (genreBlock) {
    const gLinks = [...genreBlock[1].matchAll(/<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi)];
    info.genres = gLinks.map((g) => ({
      title: cleanText(g[2]),
      genreId: slugFromUrl(g[1]) || cleanText(g[2]).toLowerCase().replace(/\s+/g, "-"),
    }));
  }
  if (!info.genres.length) {
    const looseG = [...html.matchAll(/href="[^"]*genre[^"]*\/([^"/]+)\/?"[^>]*>([^<]+)</gi)];
    info.genres = looseG.slice(0, 12).map((g) => ({
      title: cleanText(g[2]),
      genreId: g[1],
    }));
  }

  // Synopsis
  const synM =
    html.match(/Sinopsis[^<]*<\/(?:h2|h3|b|strong)>\s*([\s\S]{20,2000}?)<\/(?:div|p|section)/i) ||
    html.match(/class="[^"]*sinops[^"]*"[^>]*>([\s\S]{20,2000}?)<\//i) ||
    html.match(/<p class="[^"]*description[^"]*">([\s\S]{20,1500}?)<\/p>/i);
  if (synM) {
    info.synopsis = cleanText(
      synM[1]
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, " ")
    );
  }

  return info;
}

/**
 * Episode list – classic ot-ep + Animestream /episode/ links
 * @returns {{ep:number, title:string, url:string}[]}
 */
export function parseEpisodes(html, animeSlug = "") {
  const out = [];
  const seen = new Set();

  // Classic: <a class="ot-ep" href="..."><span>Title Episode 1</span></a>
  const classic = [
    ...html.matchAll(
      /<a class="ot-ep"\s+href="([^"]+)">\s*<span>([^<]+)<\/span>/gi
    ),
  ];
  for (const m of classic) {
    const href = absUrl(m[1]);
    if (seen.has(href)) continue;
    seen.add(href);
    const title = cleanText(m[2]);
    const epM = title.match(/(?:episode|eps|ep)\s*#?\s*(\d+)/i);
    const ep = epM ? Number(epM[1]) : out.length + 1;
    out.push({ ep, title: title || `Episode ${ep}`, url: href });
  }

  // Animestream: links /episode/slug
  if (out.length === 0) {
    const links = [...html.matchAll(/href="([^"]*\/episode\/[^"]+)"/gi)];
    for (const m of links) {
      const href = absUrl(m[1]);
      if (seen.has(href)) continue;
      seen.add(href);
      const epM = href.match(/episode[-/]?(\d+)/i) || href.match(/-(\d+)(?:\/|$)/);
      if (!epM) continue;
      const ep = Number(epM[1]);
      out.push({ ep, title: `Episode ${ep}`, url: href });
    }
  }

  // Listep / episodelist table rows
  if (out.length === 0) {
    const rows = [
      ...html.matchAll(
        /<a[^>]*href="([^"]+)"[^>]*>\s*(?:Episode\s*)?(\d+)\s*<\/a>/gi
      ),
    ];
    for (const m of rows) {
      const href = absUrl(m[1]);
      if (!href.includes("episode") && !href.includes("eps")) continue;
      if (seen.has(href)) continue;
      seen.add(href);
      const ep = Number(m[2]);
      out.push({ ep, title: `Episode ${ep}`, url: href });
    }
  }

  out.sort((a, b) => a.ep - b.ep);
  return out;
}

/**
 * Full anime detail by slug (animeId from Anyme routes).
 */
export async function getDetail(animeSlug) {
  const slug = String(animeSlug || "")
    .replace(/^otakudesu:/, "")
    .replace(/^\/+|\/+$/g, "");
  if (!slug) throw new Error("Missing anime slug");

  const path = `/anime/${slug}/`;
  const html = await fetchHtml(path);
  const info = parseInfo(html);
  const episodes = parseEpisodes(html, slug);

  if (!info.title) info.title = slug.replace(/-/g, " ");

  return {
    slug,
    title: info.title,
    japanese: info.japanese,
    poster: info.poster,
    score: info.score,
    status: info.status,
    type: info.type,
    episodes: info.episodes || (episodes.length ? String(episodes.length) : ""),
    season: info.season,
    studios: info.studios,
    duration: info.duration,
    released: info.released,
    genres: info.genres,
    synopsis: info.synopsis,
    episodeList: episodes.map((e) => ({
      ep: e.ep,
      title: e.title.startsWith("Episode") ? e.title : `Episode ${e.ep}`,
      url: e.url,
      episodeId: encodeEpisodeId(slug, e.ep, e.url),
    })),
  };
}

export async function getEpisodes(animeSlug) {
  const detail = await getDetail(animeSlug);
  return detail.episodeList;
}
