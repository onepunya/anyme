import { NextResponse } from "next/server";
import { sameOrigin, destroySession, clearSessionCookie, json } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req) {
  if (!sameOrigin(req)) return json({ error: "Forbidden" }, 403);
  try { await destroySession(req); } catch (e) { console.error("[auth:logout]", e.message); }
  const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  clearSessionCookie(res);
  return res;
}
