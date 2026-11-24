import { randomBytes } from "node:crypto";
import { getSql, ensureSchema } from "@/lib/db";
import { json, sameOrigin, getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const LIMITS = { avatar: 60 * 1024, sticker: 120 * 1024 };
const MAX_STICKERS = 30;

// Deteksi tipe dari isi file (bukan dari header yang bisa dipalsukan)
function sniff(buf) {
  if (buf.length > 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  if (buf.length > 8 && buf.readUInt32BE(0) === 0x89504e47 && buf.readUInt32BE(4) === 0x0d0a1a0a) return "image/png";
  return null;
}

// POST /api/media?kind=avatar|sticker  — body: biner gambar (webp/png) hasil resize di browser
export async function POST(req) {
  if (!sameOrigin(req)) return json({ error: "Forbidden" }, 403);
  const sql = getSql();
  const me = await getUser(req);
  if (!sql || !me) return json({ error: "Masuk dulu ya" }, 401);

  const kind = new URL(req.url).searchParams.get("kind");
  if (!LIMITS[kind]) return json({ error: "Jenis tidak valid" }, 400);

  const buf = Buffer.from(await req.arrayBuffer());
  if (buf.length === 0 || buf.length > LIMITS[kind]) {
    return json({ error: `Ukuran maksimal ${Math.round(LIMITS[kind] / 1024)} KB` }, 413);
  }
  const mime = sniff(buf);
  if (!mime) return json({ error: "Format harus WebP atau PNG" }, 415);

  try {
    await ensureSchema();

    if (kind === "sticker") {
      const [{ n }] = await sql`SELECT count(*)::int AS n FROM media WHERE user_id = ${me.id}::bigint AND kind = 'sticker'`;
      if (n >= MAX_STICKERS) return json({ error: `Maksimal ${MAX_STICKERS} stiker, hapus yang lama dulu` }, 400);
    }

    const id = randomBytes(9).toString("base64url");
    await sql`
      INSERT INTO media (id, user_id, kind, mime, data)
      VALUES (${id}, ${me.id}::bigint, ${kind}, ${mime}, decode(${buf.toString("hex")}, 'hex'))`;

    if (kind === "avatar") {
      const old = me.avatar_id;
      await sql`UPDATE users SET avatar_id = ${id} WHERE id = ${me.id}::bigint`;
      if (old) await sql`DELETE FROM media WHERE id = ${old} AND user_id = ${me.id}::bigint`;
    }
    return json({ id, kind }, 201);
  } catch (e) {
    console.error("[media:POST]", e.message);
    return json({ error: "Gagal menyimpan gambar" }, 500);
  }
}
