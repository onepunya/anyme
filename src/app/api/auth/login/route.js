import { NextResponse } from "next/server";
import { getSql, ensureSchema } from "@/lib/db";
import { json, ipHash, sameOrigin, verifyPassword, createSession, setSessionCookie, publicUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const sql = getSql();
  if (!sql) return json({ error: "Database belum dikonfigurasi" }, 503);
  if (!sameOrigin(req)) return json({ error: "Forbidden" }, 403);

  let b;
  try { b = await req.json(); } catch { return json({ error: "Body tidak valid" }, 400); }
  const username = String(b.username || "").trim().toLowerCase().slice(0, 40);
  const password = String(b.password || "").slice(0, 200);

  try {
    await ensureSchema();
    const hash = ipHash(req);

    // anti brute-force: maks 8 gagal / 10 menit per IP+username
    const [{ n }] = await sql`
      SELECT count(*)::int AS n FROM auth_attempts
      WHERE ip_hash = ${hash} AND username = ${username} AND created_at > now() - interval '10 minutes'`;
    if (n >= 8) return json({ error: "Terlalu banyak percobaan, coba lagi 10 menit lagi" }, 429);

    const rows = await sql`
      SELECT id::text AS id, username, display_name, bio, color, avatar_id, password_hash
      FROM users WHERE username = ${username}`;
    const u = rows[0];
    const ok = u ? await verifyPassword(password, u.password_hash) : false;
    if (!ok) {
      await sql`INSERT INTO auth_attempts (ip_hash, username) VALUES (${hash}, ${username})`;
      return json({ error: "Username atau password salah" }, 401);
    }

    const res = NextResponse.json({ user: publicUser(u) }, { headers: { "Cache-Control": "no-store" } });
    setSessionCookie(res, await createSession(u.id));
    return res;
  } catch (e) {
    console.error("[auth:login]", e.message);
    return json({ error: "Gagal masuk" }, 500);
  }
}
