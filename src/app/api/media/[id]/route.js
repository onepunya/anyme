import { getSql, ensureSchema } from "@/lib/db";
import { json, sameOrigin, getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ID_RE = /^[A-Za-z0-9_-]{6,32}$/;

// ID acak & tidak pernah berubah -> aman di-cache selamanya
export async function GET(_req, { params }) {
  const { id } = await params;
  const sql = getSql();
  if (!sql || !ID_RE.test(id)) return new Response("Not found", { status: 404 });
  try {
    await ensureSchema();
    const rows = await sql`SELECT mime, encode(data, 'base64') AS b64 FROM media WHERE id = ${id}`;
    if (!rows.length) return new Response("Not found", { status: 404 });
    return new Response(Buffer.from(rows[0].b64, "base64"), {
      headers: {
        "Content-Type": rows[0].mime,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    console.error("[media:GET]", e.message);
    return new Response("Error", { status: 500 });
  }
}

// Hapus stiker milik sendiri
export async function DELETE(req, { params }) {
  if (!sameOrigin(req)) return json({ error: "Forbidden" }, 403);
  const { id } = await params;
  const sql = getSql();
  const me = await getUser(req);
  if (!sql || !me) return json({ error: "Masuk dulu ya" }, 401);
  if (!ID_RE.test(id)) return json({ error: "ID tidak valid" }, 400);
  const rows = await sql`
    DELETE FROM media WHERE id = ${id} AND user_id = ${me.id}::bigint AND kind = 'sticker' RETURNING id`;
  if (!rows.length) return json({ error: "Stiker tidak ditemukan" }, 404);
  return json({ ok: true });
}
