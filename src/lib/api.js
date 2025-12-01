const BASE_URL = "https://www.sankavollerei.com/anime/samehadaku";

export async function getHomeData() {
  const res = await fetch(`${BASE_URL}/home`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch home data");
  return res.json();
}

export async function getTopAnime() {
  const data = await getHomeData();
  return data.data?.top10?.animeList || [];
}

export async function getOngoingAnime(page = 1) {
  const res = await fetch(`${BASE_URL}/ongoing?page=${page}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch ongoing anime");
  return res.json();
}

export async function getAnimeDetail(animeId) {
  const res = await fetch(`${BASE_URL}/anime/${animeId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch anime detail");
  return res.json();
}

export async function getEpisodeDetail(episodeId) {
  const res = await fetch(`${BASE_URL}/episode/${episodeId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch episode detail");
  return res.json();
}

export async function getServerUrl(serverId) {
  const res = await fetch(`${BASE_URL}/server/${serverId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch server URL");
  return res.json();
}

export async function searchAnime(query) {
  const res = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to search anime");
  return res.json();
}

export async function getRecentAnime(page = 1) {
  const res = await fetch(`${BASE_URL}/recent?page=${page}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch recent anime");
  return res.json();
}

export async function getSchedule() {
  const res = await fetch(`${BASE_URL}/schedule`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch schedule");
  return res.json();
}

export async function getGenres() {
  const res = await fetch(`${BASE_URL}/genres`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch genres");
  return res.json();
}

export async function getAnimeByGenre(genreId, page = 1) {
  const res = await fetch(`${BASE_URL}/genres/${genreId}?page=${page}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch anime by genre");
  return res.json();
}

export async function getPopularAnime(page = 1) {
  const res = await fetch(`${BASE_URL}/popular?page=${page}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch popular anime");
  return res.json();
}

export async function getBatchDetail(batchId) {
  const res = await fetch(`${BASE_URL}/batch/${batchId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch batch detail");
  return res.json();
}
