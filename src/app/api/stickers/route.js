import { getSql, ensureSchema } from "@/lib/db";
import { json, getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const sql = getSql();
  const me = await getUser(req);
  if (!sql || !me) return json({ stickers: [] });
  await ensureSchema();
  const rows = await sql`
    SELECT id FROM media WHERE user_id = ${me.id}::bigint AND kind = 'sticker' ORDER BY created_at DESC`;
  return json({ stickers: rows.map((r) => r.id) });
}
