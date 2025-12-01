import { getAnimeDetail } from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    try {
        const { animeId } = await params;
        const data = await getAnimeDetail(animeId);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch anime details" },
            { status: 500 }
        );
    }
}
