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
  const data = await res.json();
  return data.data?.animeList || [];
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
