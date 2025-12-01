import { getGenres } from "@/lib/api";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default async function GenresPage() {
    const genresData = await getGenres();
    const genres = genresData?.data?.genreList || [];

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Browse by Genre</h1>
                <p className="text-muted-foreground">
                    Explore anime by your favorite genres
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {genres.map((genre) => (
                    <Link key={genre.genreId} href={`/genres/${genre.genreId}`}>
                        <Card className="group h-full transition-all hover:shadow-lg hover:border-primary">
                            <CardContent className="flex h-24 items-center justify-center p-4">
                                <h3 className="text-center font-semibold text-sm transition-colors group-hover:text-primary">
                                    {genre.title}
                                </h3>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
