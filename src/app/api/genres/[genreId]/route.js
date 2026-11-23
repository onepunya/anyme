import { getAnimeByGenre } from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    try {
        const { genreId } = await params;
        const { searchParams } = new URL(request.url);
        const page = searchParams.get("page") || "1";

        const data = await getAnimeByGenre(genreId, parseInt(page));
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch anime" },
            { status: 500 }
        );
    }
}
