import { getSql, ensureSchema } from "@/lib/db";
import { json, ipHash, sameOrigin, getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// contoh key: anime:one-piece | episode:xxx | manga:solo-leveling | chapter:solo-leveling-chapter-1
const THREAD_RE = /^(anime|episode|manga|chapter):[A-Za-z0-9._~%-]{1,200}$/;
const MEDIA_ID_RE = /^[A-Za-z0-9_-]{6,32}$/;
const PAGE_SIZE = 15;

export async function GET(req) {
  const sql = getSql();
  if (!sql) return json({ error: "Database belum dikonfigurasi" }, 503);

  const { searchParams } = new URL(req.url);
  const thread = searchParams.get("thread") || "";
  const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10) || 0);
  if (!THREAD_RE.test(thread)) return json({ error: "Thread tidak valid" }, 400);

  try {
    await ensureSchema();
    const tops = await sql`
      SELECT c.id::text AS id, COALESCE(u.display_name, c.name) AS name, u.username, u.color,
             u.avatar_id, c.sticker_id, c.content, c.created_at
      FROM comments c LEFT JOIN users u ON u.id = c.user_id
      WHERE c.thread_key = ${thread} AND c.parent_id IS NULL
      ORDER BY c.created_at DESC
      LIMIT ${PAGE_SIZE + 1} OFFSET ${offset}`;
    const hasMore = tops.length > PAGE_SIZE;
    const page = tops.slice(0, PAGE_SIZE);

    let replies = [];
    if (page.length) {
      replies = await sql`
        SELECT c.id::text AS id, c.parent_id::text AS parent_id, COALESCE(u.display_name, c.name) AS name,
               u.username, u.color, u.avatar_id, c.sticker_id, c.content, c.created_at
        FROM comments c LEFT JOIN users u ON u.id = c.user_id
        WHERE c.parent_id = ANY(${page.map((c) => c.id)}::bigint[])
        ORDER BY c.created_at ASC`;
    }
    const [{ total }] = await sql`SELECT count(*)::int AS total FROM comments WHERE thread_key = ${thread}`;

    const comments = page.map((c) => ({ ...c, replies: replies.filter((r) => r.parent_id === c.id) }));
    return json({ comments, total, hasMore, nextOffset: offset + page.length });
  } catch (e) {
    console.error("[comments:GET]", e.message);
    return json({ error: "Gagal memuat komentar" }, 500);
  }
}

export async function POST(req) {
  const sql = getSql();
  if (!sql) return json({ error: "Database belum dikonfigurasi" }, 503);
  if (!sameOrigin(req)) return json({ error: "Forbidden" }, 403);

  // wajib login untuk berkomentar
  const me = await getUser(req);
  if (!me) return json({ error: "Masuk dulu untuk berkomentar" }, 401);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Body tidak valid" }, 400);
  }

  const thread = String(body.thread || "");
  const content = String(body.content || "").replace(/\r\n/g, "\n").trim();
  const parentId = body.parentId ? String(body.parentId) : null;
  const stickerId = body.stickerId ? String(body.stickerId) : null;

  if (!THREAD_RE.test(thread)) return json({ error: "Thread tidak valid" }, 400);
  if (!content && !stickerId) return json({ error: "Tulis komentar atau pilih stiker" }, 400);
  if (content.length > 1000) return json({ error: "Komentar maksimal 1000 karakter" }, 400);
  if ((content.match(/https?:\/\//gi) || []).length > 2) return json({ error: "Maksimal 2 link per komentar" }, 400);
  if (parentId && !/^\d{1,18}$/.test(parentId)) return json({ error: "Parent tidak valid" }, 400);
  if (stickerId && !MEDIA_ID_RE.test(stickerId)) return json({ error: "Stiker tidak valid" }, 400);

  try {
    await ensureSchema();
    const hash = ipHash(req);

    // rate limit: maks 3 komentar / menit / akun
    const [{ n }] = await sql`
      SELECT count(*)::int AS n FROM comments
      WHERE user_id = ${me.id}::bigint AND created_at > now() - interval '1 minute'`;
    if (n >= 3) return json({ error: "Terlalu cepat, tunggu sebentar ya" }, 429);

    // stiker harus milik sendiri
    if (stickerId) {
      const own = await sql`
        SELECT 1 FROM media WHERE id = ${stickerId} AND user_id = ${me.id}::bigint AND kind = 'sticker'`;
      if (!own.length) return json({ error: "Stiker tidak ditemukan" }, 404);
    }

    // reply selalu dikaitkan ke komentar induk (1 level) di thread yang sama
    let realParent = null;
    if (parentId) {
      const rows = await sql`
        SELECT id::text AS id, parent_id::text AS parent_id FROM comments
        WHERE id = ${parentId}::bigint AND thread_key = ${thread}`;
      if (!rows.length) return json({ error: "Komentar induk tidak ditemukan" }, 404);
      realParent = rows[0].parent_id || rows[0].id;
    }

    const [row] = await sql`
      INSERT INTO comments (thread_key, parent_id, name, content, ip_hash, user_id, sticker_id)
      VALUES (${thread}, ${realParent}::bigint, ${me.display_name}, ${content}, ${hash}, ${me.id}::bigint, ${stickerId})
      RETURNING id::text AS id`;
    return json({ comment: row }, 201);
  } catch (e) {
    console.error("[comments:POST]", e.message);
    return json({ error: "Gagal mengirim komentar" }, 500);
  }
}
