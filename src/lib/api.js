/**
 * Anyme data layer
 * Primary: Otakudesu (Sub Indo)
 * Phase 1: lists + search
 * Phase 2: anime detail + episode list
 * Phase 3: episode stream / server resolve
 */

import * as otaku from "./scrapers/otakudesu.js";
import * as stream from "./scrapers/stream.js";
import {
  toListResponse,
  toSearchResponse,
  toHomeResponse,
  toDetailResponse,
} from "./scrapers/adapters.js";

// ---------- Home / lists (Phase 1) ----------

export async function getHomeData() {
  try {
    const home = await otaku.getHome();
    return toHomeResponse(home);
  } catch (err) {
    console.error("[api] getHomeData failed:", err?.message || err);
    return toHomeResponse({ top: [], ongoing: [], recent: [] });
  }
}

export async function getTopAnime() {
  const data = await getHomeData();
  return data.data?.top10?.animeList || [];
}

export async function getOngoingAnime(page = 1) {
  try {
    const cards = await otaku.getOngoing(page);
    return toListResponse(cards, page);
  } catch (err) {
    console.error("[api] getOngoingAnime failed:", err?.message || err);
    return toListResponse([], page);
  }
}

export async function getPopularAnime(page = 1) {
  try {
    const cards = await otaku.getPopular(page);
    return toListResponse(cards, page);
  } catch (err) {
    console.error("[api] getPopularAnime failed:", err?.message || err);
    return toListResponse([], page);
  }
}

export async function getRecentAnime(page = 1) {
  try {
    const home = await otaku.getHome();
    return toListResponse(home.recent || home.ongoing || [], page);
  } catch (err) {
    console.error("[api] getRecentAnime failed:", err?.message || err);
    return toListResponse([], page);
  }
}

export async function searchAnime(query) {
  try {
    const cards = await otaku.search(query, 30);
    return toSearchResponse(cards);
  } catch (err) {
    console.error("[api] searchAnime failed:", err?.message || err);
    return toSearchResponse([]);
  }
}

// ---------- Detail (Phase 2) ----------

export async function getAnimeDetail(animeId) {
  try {
    const detail = await otaku.getDetail(animeId);
    return toDetailResponse(detail);
  } catch (err) {
    console.error("[api] getAnimeDetail failed:", err?.message || err);
    return {
      status: "error",
      message: err?.message || "Failed to fetch anime detail",
      data: null,
    };
  }
}

// ---------- Episode stream (Phase 3) ----------

function groupServersByQuality(servers) {
  const map = new Map();
  for (const s of servers) {
    const q = s.quality || "auto";
    if (!map.has(q)) map.set(q, []);
    map.get(q).push({
      serverId: s.id,
      title: s.title,
    });
  }
  // Prefer 720p first in UI
  const order = ["720p", "480p", "360p", "auto"];
  const qualities = [];
  const seen = new Set();
  for (const q of order) {
    if (map.has(q)) {
      qualities.push({ title: q, serverList: map.get(q) });
      seen.add(q);
    }
  }
  for (const [q, list] of map) {
    if (!seen.has(q)) qualities.push({ title: q, serverList: list });
  }
  return qualities;
}

export async function getEpisodeDetail(episodeId) {
  try {
    const decoded = otaku.decodeEpisodeId(episodeId);
    if (!decoded) {
      return {
        status: "error",
        message: "Format episodeId tidak dikenal",
        data: null,
      };
    }

    let epUrl = decoded.epUrl;
    if (!epUrl) {
      // Rebuild from anime detail episode list
      const detail = await otaku.getDetail(decoded.animeSlug);
      const hit = (detail.episodeList || []).find(
        (e) => e.ep === decoded.ep || e.episodeId === episodeId
      );
      epUrl = hit?.url;
      if (!epUrl) {
        return {
          status: "error",
          message: `Episode ${decoded.ep} tidak ditemukan`,
          data: null,
        };
      }
    }

    const { defaultUrl, servers } = await stream.resolveEpisodeServers(epUrl);
    const qualities = groupServersByQuality(servers);

    const totalHint = servers.length;
    return {
      status: "success",
      data: {
        title: `Episode ${decoded.ep}`,
        episodeId,
        animeId: decoded.animeSlug,
        ep: decoded.ep,
        defaultStreamingUrl: defaultUrl || "",
        server: { qualities },
        hasPrevEpisode: decoded.ep > 1,
        hasNextEpisode: true,
        synopsis: { paragraphs: [] },
        _meta: {
          source: "otakudesu",
          serverCount: totalHint,
        },
      },
    };
  } catch (err) {
    console.error("[api] getEpisodeDetail failed:", err?.message || err);
    return {
      status: "error",
      message: err?.message || "Failed to resolve episode",
      data: null,
    };
  }
}

export async function getServerUrl(serverId) {
  try {
    const resolved = await stream.resolveServerUrl(serverId);
    return {
      status: "success",
      data: {
        url: resolved.url,
        type: resolved.type || "embed",
        stream: resolved.stream || null,
      },
    };
  } catch (err) {
    console.error("[api] getServerUrl failed:", err?.message || err);
    return {
      status: "error",
      message: err?.message || "Failed to resolve server",
      data: null,
    };
  }
}

export async function getSchedule() {
  return { status: "success", data: { days: [] } };
}

export async function getGenres() {
  return { status: "success", data: { genreList: [] } };
}

export async function getAnimeByGenre(genreId, page = 1) {
  return toListResponse([], page);
}

export async function getBatchDetail(batchId) {
  return { status: "error", message: "Batch belum didukung", data: null };
}

export async function getMovieAnime(page = 1) {
  return getPopularAnime(page);
}
