import { getServerUrl } from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    try {
        const { serverId } = await params;
        const data = await getServerUrl(serverId);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch server URL" },
            { status: 500 }
        );
    }
}
