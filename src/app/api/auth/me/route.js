import { getSql } from "@/lib/db";
import { json, sameOrigin, getUser, publicUser, COLORS } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const u = await getUser(req);
    return json({ user: u ? publicUser(u) : null });
  } catch (e) {
    console.error("[auth:me]", e.message);
    return json({ user: null });
  }
}

export async function PATCH(req) {
  if (!sameOrigin(req)) return json({ error: "Forbidden" }, 403);
  const sql = getSql();
  const me = await getUser(req);
  if (!sql || !me) return json({ error: "Belum masuk" }, 401);

  let b;
  try { b = await req.json(); } catch { return json({ error: "Body tidak valid" }, 400); }

  const displayName = String(b.displayName ?? me.display_name).replace(/\s+/g, " ").trim();
  const bio = String(b.bio ?? me.bio).trim();
  const color = String(b.color ?? me.color);
  if (displayName.length < 1 || displayName.length > 30) return json({ error: "Nama tampilan 1–30 karakter" }, 400);
  if (bio.length > 160) return json({ error: "Bio maksimal 160 karakter" }, 400);
  if (!COLORS.includes(color)) return json({ error: "Warna tidak valid" }, 400);

  const [u] = await sql`
    UPDATE users SET display_name = ${displayName}, bio = ${bio}, color = ${color}
    WHERE id = ${me.id}::bigint
    RETURNING id::text AS id, username, display_name, bio, color, avatar_id`;
  return json({ user: publicUser(u) });
}
