import { getOngoingAnime } from "@/lib/api";
import OngoingClient from "@/components/OngoingClient";

export const metadata = {
  title: "Ongoing Anime - KaelNime",
  description: "Browse all currently airing anime series",
};

export default async function OngoingPage() {
  const ongoingData = await getOngoingAnime(1);

  return <OngoingClient initialData={ongoingData} />;
}
