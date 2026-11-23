import { getPopularAnime } from "@/lib/api";
import PopularClient from "@/components/PopularClient";

export default async function PopularPage() {
    const popularData = await getPopularAnime(1);

    return <PopularClient initialData={popularData} />;
}
