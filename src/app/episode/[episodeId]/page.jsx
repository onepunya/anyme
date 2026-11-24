export const dynamic = 'force-dynamic';

import { getEpisodeDetail } from "@/lib/api";
import EpisodePlayer from "@/components/EpisodePlayer";
import { shareMeta } from "@/lib/site";

export async function generateMetadata({ params }) {
  const { episodeId } = await params;
  try {
    const response = await getEpisodeDetail(episodeId);
    const episode = response.data;
    return shareMeta({
      title: `${episode.title || 'Episode'} - Anyme`,
      description: episode.synopsis?.paragraphs?.[0] || 'Nonton episode ini sub Indo gratis di Anyme',
      image: episode.poster,
    });
  } catch (error) {
    return shareMeta({ title: 'Episode - Anyme', description: 'Nonton episode anime sub Indo gratis' });
  }
}

export default async function EpisodePage({ params }) {
  const { episodeId } = await params;
  const response = await getEpisodeDetail(episodeId);
  const episode = response.data;

  return <EpisodePlayer episode={episode} episodeId={episodeId} />;
}
