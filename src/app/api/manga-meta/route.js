import { NextResponse } from "next/server";
import { getKomikDetail } from "@/lib/komik";

export const dynamic = "force-dynamic";

// GET /api/manga-meta?slug=... -> { title, image } (untuk cover di riwayat baca)
export async function GET(req) {
  const slug = new URL(req.url).searchParams.get("slug") || "";
  if (!/^[a-z0-9][a-z0-9-]{0,200}$/i.test(slug)) {
    return NextResponse.json({ error: "slug tidak valid" }, { status: 400 });
  }
  const m = await getKomikDetail(slug);
  if (!m) return NextResponse.json({ error: "tidak ditemukan" }, { status: 404 });
  return NextResponse.json(
    { title: m.title, image: m.image },
    { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } }
  );
}
