import { getMovieAnime } from "@/lib/api";
import MovieClient from "@/components/MovieClient";

export const metadata = {
    title: "Movie Anime - KaelNime",
    description: "Browse all anime movies",
};

export default async function MoviePage() {
    const movieData = await getMovieAnime(1);

    return <MovieClient initialData={movieData} />;
}
