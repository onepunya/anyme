import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import { getSql, ensureSchema } from "@/lib/db";

const scryptAsync = promisify(scrypt);

export const COOKIE = "anyme_session";
const SESSION_DAYS = 30;

export const COLORS = ["default", "orange", "red", "pink", "purple", "blue", "green"];

export const json = (data, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

const sha = (t) => createHash("sha256").update(t).digest("hex");

export function ipHash(req) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  return sha(ip + (process.env.COMMENT_SALT || "anyme")).slice(0, 32);
}

// Tolak request lintas-origin (lapisan tambahan di atas SameSite=Lax)
export function sameOrigin(req) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

export async function hashPassword(pw) {
  const salt = randomBytes(16);
  const key = await scryptAsync(pw, salt, 64);
  return `s1$${salt.toString("hex")}$${key.toString("hex")}`;
}

export async function verifyPassword(pw, stored) {
  const [v, saltHex, keyHex] = String(stored).split("$");
  if (v !== "s1" || !saltHex || !keyHex) return false;
  const key = await scryptAsync(pw, Buffer.from(saltHex, "hex"), 64);
  const expected = Buffer.from(keyHex, "hex");
  return expected.length === key.length && timingSafeEqual(expected, key);
}

export async function createSession(userId) {
  const sql = getSql();
  const token = randomBytes(32).toString("hex");
  await sql`
    INSERT INTO sessions (token_hash, user_id, expires_at)
    VALUES (${sha(token)}, ${userId}::bigint, now() + ${SESSION_DAYS + " days"}::interval)`;
  return token;
}

export function setSessionCookie(res, token) {
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 3600,
  });
}

export function clearSessionCookie(res) {
  res.cookies.set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export const publicUser = (u) => ({
  id: u.id,
  username: u.username,
  displayName: u.display_name,
  bio: u.bio,
  color: u.color,
  avatarId: u.avatar_id,
});

// Kembalikan user dari cookie sesi, atau null
export async function getUser(req) {
  const sql = getSql();
  const token = req.cookies.get(COOKIE)?.value;
  if (!sql || !token) return null;
  await ensureSchema();
  const rows = await sql`
    SELECT u.id::text AS id, u.username, u.display_name, u.bio, u.color, u.avatar_id
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ${sha(token)} AND s.expires_at > now()`;
  return rows[0] || null;
}

export async function destroySession(req) {
  const sql = getSql();
  const token = req.cookies.get(COOKIE)?.value;
  if (sql && token) await sql`DELETE FROM sessions WHERE token_hash = ${sha(token)}`;
}
