import { getOngoingAnime } from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = searchParams.get("page") || "1";

        const data = await getOngoingAnime(parseInt(page));
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch ongoing anime" },
            { status: 500 }
        );
    }
}
