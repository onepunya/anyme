import { getMovieAnime } from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = searchParams.get("page") || "1";

        const data = await getMovieAnime(parseInt(page));
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch movie anime" },
            { status: 500 }
        );
    }
}
