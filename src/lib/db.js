import { neon } from "@neondatabase/serverless";

// DATABASE_URL diisi lewat environment variable (.env.local / Vercel), JANGAN ditulis di kode.
let _sql = null;
export function getSql() {
  if (!process.env.DATABASE_URL) return null;
  if (!_sql) _sql = neon(process.env.DATABASE_URL);
  return _sql;
}

let _ready = null;
// Buat tabel otomatis saat pertama kali dipakai (aman dipanggil berkali-kali)
export function ensureSchema() {
  const sql = getSql();
  if (!sql) return Promise.resolve(false);
  if (!_ready) {
    _ready = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id            BIGSERIAL PRIMARY KEY,
          username      TEXT NOT NULL UNIQUE,
          display_name  TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          bio           TEXT NOT NULL DEFAULT '',
          color         TEXT NOT NULL DEFAULT 'default',
          avatar_id     TEXT,
          ip_hash       TEXT,
          created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
        )`;
      await sql`
        CREATE TABLE IF NOT EXISTS sessions (
          token_hash TEXT PRIMARY KEY,
          user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          expires_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`;
      await sql`
        CREATE TABLE IF NOT EXISTS media (
          id         TEXT PRIMARY KEY,
          user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          kind       TEXT NOT NULL,
          mime       TEXT NOT NULL,
          data       BYTEA NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`;
      await sql`CREATE INDEX IF NOT EXISTS media_user_idx ON media (user_id, kind, created_at DESC)`;
      await sql`
        CREATE TABLE IF NOT EXISTS auth_attempts (
          id         BIGSERIAL PRIMARY KEY,
          ip_hash    TEXT NOT NULL,
          username   TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`;
      await sql`CREATE INDEX IF NOT EXISTS auth_attempts_idx ON auth_attempts (ip_hash, username, created_at DESC)`;
      await sql`
        CREATE TABLE IF NOT EXISTS comments (
          id         BIGSERIAL PRIMARY KEY,
          thread_key TEXT NOT NULL,
          parent_id  BIGINT REFERENCES comments(id) ON DELETE CASCADE,
          name       TEXT NOT NULL,
          content    TEXT NOT NULL,
          ip_hash    TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`;
      // kolom baru untuk akun & stiker (komentar anonim lama tetap aman)
      await sql`ALTER TABLE comments ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id) ON DELETE SET NULL`;
      await sql`ALTER TABLE comments ADD COLUMN IF NOT EXISTS sticker_id TEXT REFERENCES media(id) ON DELETE SET NULL`;
      await sql`CREATE INDEX IF NOT EXISTS comments_thread_idx ON comments (thread_key, parent_id, created_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS comments_ip_idx ON comments (ip_hash, created_at DESC)`;
      return true;
    })().catch((e) => {
      _ready = null; // coba lagi di request berikutnya
      throw e;
    });
  }
  return _ready;
}
