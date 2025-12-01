import { getEpisodeDetail } from "@/lib/api";
import EpisodePlayer from "@/components/EpisodePlayer";

export async function generateMetadata({ params }) {
  const { episodeId } = await params;
  try {
    const response = await getEpisodeDetail(episodeId);
    const episode = response.data;
    return {
      title: `${episode.title || 'Episode'} - KaelNime`,
      description: episode.synopsis?.paragraphs?.[0] || 'Watch anime episode online',
    };
  } catch (error) {
    return {
      title: 'Episode - KaelNime',
      description: 'Watch anime episode online',
    };
  }
}

export default async function EpisodePage({ params }) {
  const { episodeId } = await params;
  const response = await getEpisodeDetail(episodeId);
  const episode = response.data;

  return <EpisodePlayer episode={episode} episodeId={episodeId} />;
}
