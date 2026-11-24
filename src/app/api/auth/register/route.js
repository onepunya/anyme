import { NextResponse } from "next/server";
import { getSql, ensureSchema } from "@/lib/db";
import { json, ipHash, sameOrigin, hashPassword, createSession, setSessionCookie, publicUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const sql = getSql();
  if (!sql) return json({ error: "Database belum dikonfigurasi" }, 503);
  if (!sameOrigin(req)) return json({ error: "Forbidden" }, 403);

  let b;
  try { b = await req.json(); } catch { return json({ error: "Body tidak valid" }, 400); }

  const username = String(b.username || "").trim().toLowerCase();
  const password = String(b.password || "");
  if (!/^[a-z0-9_]{3,20}$/.test(username)) return json({ error: "Username 3–20 karakter: huruf kecil, angka, _" }, 400);
  if (password.length < 8 || password.length > 72) return json({ error: "Password 8–72 karakter" }, 400);

  try {
    await ensureSchema();
    const hash = ipHash(req);
    const [{ n }] = await sql`
      SELECT count(*)::int AS n FROM users WHERE ip_hash = ${hash} AND created_at > now() - interval '1 hour'`;
    if (n >= 5) return json({ error: "Terlalu banyak pendaftaran dari jaringan ini, coba lagi nanti" }, 429);

    const exists = await sql`SELECT 1 FROM users WHERE username = ${username}`;
    if (exists.length) return json({ error: "Username sudah dipakai" }, 409);

    const [user] = await sql`
      INSERT INTO users (username, display_name, password_hash, ip_hash)
      VALUES (${username}, ${username}, ${await hashPassword(password)}, ${hash})
      RETURNING id::text AS id, username, display_name, bio, color, avatar_id`;

    const res = NextResponse.json({ user: publicUser(user) }, { status: 201, headers: { "Cache-Control": "no-store" } });
    setSessionCookie(res, await createSession(user.id));
    return res;
  } catch (e) {
    if (e?.code === "23505") return json({ error: "Username sudah dipakai" }, 409);
    console.error("[auth:register]", e.message);
    return json({ error: "Gagal mendaftar" }, 500);
  }
}
