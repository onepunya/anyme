import { getAnimeByGenre } from "@/lib/api";
import GenreClient from "@/components/GenreClient";

export default async function GenrePage({ params }) {
    const { genreId } = await params;
    const genreData = await getAnimeByGenre(genreId, 1);

    const genreTitle = genreId
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    return (
        <GenreClient
            initialData={genreData}
            genreId={genreId}
            genreTitle={genreTitle}
        />
    );
}
