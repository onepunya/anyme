/**
 * Adapter: Otakudesu → Anyme UI response shapes
 */

export function toAnimeItem(card, extra = {}) {
  if (!card) return null;
  return {
    animeId: card.id || card.animeId || card.slug || "",
    title: card.title || "Unknown",
    poster: card.poster || "",
    href: card.url || (card.id ? `/anime/${card.id}` : "#"),
    ...extra,
  };
}

export function toListResponse(cards = [], page = 1) {
  const animeList = cards.map((c, i) =>
    toAnimeItem(c, { rank: c.rank ?? (page === 1 ? i + 1 : undefined) })
  );
  return {
    status: "success",
    data: {
      animeList,
      pagination: {
        currentPage: page,
        hasNextPage: animeList.length >= 20,
      },
    },
  };
}

export function toSearchResponse(cards = []) {
  return {
    status: "success",
    data: {
      animeList: cards.map((c) => toAnimeItem(c)),
    },
  };
}

export function toHomeResponse(home) {
  return {
    status: "success",
    data: {
      top10: {
        animeList: (home.top || []).map((c, i) =>
          toAnimeItem(c, { rank: c.rank || i + 1 })
        ),
      },
      ongoing: {
        animeList: (home.ongoing || []).map((c) => toAnimeItem(c)),
      },
      recent: {
        animeList: (home.recent || []).map((c) => toAnimeItem(c)),
      },
    },
  };
}

/**
 * Detail → shape expected by app/anime/[animeId]/page.jsx
 */
export function toDetailResponse(detail) {
  if (!detail) {
    return { status: "error", message: "Not found", data: null };
  }

  const paragraphs = detail.synopsis
    ? detail.synopsis
        .split(/\n+/)
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  return {
    status: "success",
    data: {
      animeId: detail.slug,
      title: detail.title,
      english: detail.title,
      japanese: detail.japanese || "",
      poster: detail.poster || "",
      score: detail.score ? { value: detail.score } : null,
      status: detail.status || "",
      type: detail.type || "",
      episodes: detail.episodes || (detail.episodeList?.length ?? ""),
      season: detail.season || "",
      studios: detail.studios || "",
      duration: detail.duration || "",
      genreList: (detail.genres || []).map((g) => ({
        genreId: g.genreId || g.title?.toLowerCase().replace(/\s+/g, "-"),
        title: g.title,
      })),
      synopsis: {
        paragraphs,
        connections: [],
      },
      batchList: [],
      episodeList: (detail.episodeList || []).map((ep) => ({
        episodeId: ep.episodeId,
        title: ep.title || `Episode ${ep.ep}`,
        ep: ep.ep,
      })),
    },
  };
}
