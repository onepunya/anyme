/**
 * Otakudesu stream resolver (Phase 3)
 * - Putarin embed: AES-256-GCM decrypt (same as Lumio)
 * - Animestream WP ajax mirrors
 * - Generic iframe embeds as fallback servers
 */

import crypto from "crypto";
import { fetchHtml, postForm, getBase } from "./fetch.js";

function absUrl(href, base) {
  if (!href) return "";
  if (href.startsWith("//")) return "https:" + href;
  if (href.startsWith("http")) return href;
  const b = (base || getBase()).replace(/\/$/, "");
  return href.startsWith("/") ? b + href : b + "/" + href;
}

/** Encode serverId for /api/server/[serverId] */
export function encodeServerId(payload) {
  const json = JSON.stringify(payload);
  return Buffer.from(json, "utf8")
    .toString("base64url")
    .replace(/=+$/, "");
}

export function decodeServerId(serverId) {
  try {
    const pad = serverId.length % 4 === 0 ? "" : "=".repeat(4 - (serverId.length % 4));
    const json = Buffer.from(serverId + pad, "base64url").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * AES-256-GCM decrypt putarin config (Node crypto).
 * raw = iv(12) || ciphertext || tag(16)
 */
function decryptPutarinAes(keyHex, ciphertextB64) {
  const key = Buffer.from(keyHex.trim(), "hex");
  if (key.length < 32) throw new Error("Invalid AES key length");
  const raw = Buffer.from(ciphertextB64, "base64");
  if (raw.length < 12 + 16) throw new Error("Ciphertext too short");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(raw.length - 16);
  const data = raw.subarray(12, raw.length - 16);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key.subarray(0, 32), iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(data), decipher.final()]);
  return JSON.parse(plain.toString("utf8"));
}

/**
 * Decrypt putarin embed → { file/sources, _origin }
 */
export async function decryptPutarinConfig(embedUrl) {
  const html = await fetchHtml(embedUrl, { referer: getBase() + "/", timeout: 10000 });
  const pxM = html.match(/window\.__PX\s*=\s*(\{[^<]+\});/);
  if (!pxM) throw new Error("Putarin __PX token not found");

  let px;
  try {
    px = JSON.parse(pxM[1]);
  } catch {
    throw new Error("Invalid __PX JSON");
  }
  const nonce = px.n;
  const ciphertextB64 = px.d;
  if (!nonce || !ciphertextB64) throw new Error("Incomplete __PX payload");

  const parsed = new URL(embedUrl.startsWith("//") ? "https:" + embedUrl : embedUrl);
  const origin = `${parsed.protocol}//${parsed.host}`;
  const keyUrl = `${origin}/api/pk?n=${encodeURIComponent(nonce)}`;
  const keyHex = (await fetchHtml(keyUrl, { referer: embedUrl, timeout: 8000 })).trim();
  if (keyHex.length < 64) throw new Error("Invalid putarin key");

  const config = decryptPutarinAes(keyHex, ciphertextB64);
  config._origin = origin;
  return config;
}

/**
 * Collect iframe embeds from episode HTML.
 */
function collectIframes(epHtml) {
  const out = [];
  const re = /<iframe[^>]+src=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(epHtml)) !== null) {
    let src = absUrl(m[1]);
    if (!src || src.includes("javascript:")) continue;
    out.push(src);
  }
  return out;
}

/**
 * Try extract direct m3u8/mp4 from player page HTML.
 */
function extractDirectStream(playerHtml) {
  const patterns = [
    /https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i,
    /file\s*:\s*["']([^"']+)["']/i,
    /source\s*:\s*["']([^"']+)["']/i,
    /<source[^>]+src=["']([^"']+)["']/i,
    /https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/i,
  ];
  for (const pat of patterns) {
    const m = playerHtml.match(pat);
    if (m) {
      let u = m[1] || m[0];
      if (u.startsWith("//")) u = "https:" + u;
      if (u.startsWith("http")) return u;
    }
  }
  return null;
}

/**
 * Animestream WordPress ajax mirrors (otakudesu.blog theme).
 * Returns list of { title, quality, embedUrl?, streamUrl? }
 */
export async function extractAnimestreamMirrors(epHtml, epUrl) {
  const mirrors = [];
  const re =
    /data-content="([A-Za-z0-9+/=]+)"(\s+data-default="true")?>([^<]*)<\/a>/gi;
  let m;
  while ((m = re.exec(epHtml)) !== null) {
    try {
      const payload = JSON.parse(Buffer.from(m[1], "base64").toString("utf8"));
      mirrors.push({
        payload,
        name: (m[3] || "").trim(),
        isDefault: Boolean(m[2]),
      });
    } catch {
      /* skip */
    }
  }
  if (!mirrors.length) return [];

  const actM = epHtml.match(/\{\.\.\.e,nonce:[^,]+,action:"([a-f0-9]{32})"/);
  const actN = [...epHtml.matchAll(/data:\{action:"([a-f0-9]{32})"\}/g)].map(
    (x) => x[1]
  );
  if (!actM || !actN.length) return [];

  const base = getBase();
  const ajaxUrl = base + "/wp-admin/admin-ajax.php";

  let nonce = null;
  try {
    const j = await postForm(
      ajaxUrl,
      { action: actN[0] },
      { referer: epUrl, json: true, timeout: 8000 }
    );
    nonce = j?.data;
  } catch {
    return [];
  }
  if (!nonce) return [];

  // Prefer default / 720 / known hosts
  const rank = (mir) => {
    const nm = (mir.name || "").toLowerCase();
    let s = mir.isDefault ? 0 : 10;
    if (nm.includes("mega")) s += 90;
    if (String(mir.payload?.q || "").includes("720")) s += 0;
    else if (String(mir.payload?.q || "").includes("480")) s += 3;
    else s += 6;
    return s;
  };
  mirrors.sort((a, b) => rank(a) - rank(b));

  const results = [];
  for (const mir of mirrors.slice(0, 5)) {
    try {
      const data = { ...mir.payload, nonce, action: actM[1] };
      const j = await postForm(ajaxUrl, data, {
        referer: epUrl,
        json: true,
        timeout: 8000,
      });
      const b64 = j?.data;
      if (!b64) continue;
      const embedHtml = Buffer.from(b64, "base64").toString("utf8");
      const srcM = embedHtml.match(/<iframe[^>]*src=["']([^"']+)["']/i);
      if (!srcM) continue;
      let embedUrl = absUrl(srcM[1]);
      if (
        embedUrl.includes("maintenance") ||
        embedUrl.toLowerCase().includes("mega")
      )
        continue;

      let streamUrl = null;
      try {
        const player = await fetchHtml(embedUrl, {
          referer: base + "/",
          timeout: 8000,
        });
        streamUrl = extractDirectStream(player);
      } catch {
        /* keep embed only */
      }

      results.push({
        title: mir.name || mir.payload?.q || "Server",
        quality: String(mir.payload?.q || "720p"),
        embedUrl,
        streamUrl,
      });
    } catch {
      continue;
    }
  }
  return results;
}

/**
 * Resolve all playable servers for an episode page.
 * @param {string} epUrl - full episode URL
 * @returns {Promise<{defaultUrl, servers: [{id,title,quality,url,type}]}>}
 */
export async function resolveEpisodeServers(epUrl) {
  const epHtml = await fetchHtml(epUrl, {
    referer: getBase() + "/",
    timeout: 12000,
  });

  const servers = [];
  let defaultUrl = "";

  // 1) Putarin iframe
  const putarinM = epHtml.match(
    /<iframe[^>]*src=["']([^"']*putarin\.[a-z]+\/e\/[^"']+)["']/i
  );
  if (putarinM) {
    let embedUrl = absUrl(putarinM[1]);
    let streamUrl = null;
    try {
      const cfg = await decryptPutarinConfig(embedUrl);
      const origin = cfg._origin || "https://putarin.xyz";
      const hlsRel =
        cfg.file ||
        (Array.isArray(cfg.sources) && cfg.sources[0]?.file) ||
        null;
      if (hlsRel) {
        streamUrl = hlsRel.startsWith("http")
          ? hlsRel
          : new URL(hlsRel, origin).href;
      }
    } catch (e) {
      console.error("[stream] putarin decrypt failed:", e?.message || e);
    }
    const id = encodeServerId({
      t: "putarin",
      embed: embedUrl,
      stream: streamUrl || null,
    });
    // Prefer embed for iframe player in Anyme; stream kept for future HLS player
    const playUrl = embedUrl;
    servers.push({
      id,
      title: "Putarin",
      quality: "720p",
      url: playUrl,
      streamUrl,
      type: "embed",
    });
    if (!defaultUrl) defaultUrl = playUrl;
  }

  // 2) Animestream mirrors
  try {
    const mirrors = await extractAnimestreamMirrors(epHtml, epUrl);
    for (const mir of mirrors) {
      const playUrl = mir.embedUrl || mir.streamUrl;
      if (!playUrl) continue;
      const id = encodeServerId({
        t: "mirror",
        embed: mir.embedUrl || null,
        stream: mir.streamUrl || null,
        name: mir.title,
      });
      servers.push({
        id,
        title: mir.title || "Mirror",
        quality: mir.quality || "720p",
        url: playUrl,
        streamUrl: mir.streamUrl,
        type: mir.streamUrl ? "hls" : "embed",
      });
      if (!defaultUrl) defaultUrl = playUrl;
    }
  } catch (e) {
    console.error("[stream] animestream failed:", e?.message || e);
  }

  // 3) Other iframes on page
  for (const src of collectIframes(epHtml)) {
    if (servers.some((s) => s.url === src)) continue;
    if (/putarin\./i.test(src)) continue;
    const host = (() => {
      try {
        return new URL(src).hostname.replace(/^www\./, "");
      } catch {
        return "Server";
      }
    })();
    const id = encodeServerId({ t: "iframe", embed: src });
    servers.push({
      id,
      title: host,
      quality: "auto",
      url: src,
      streamUrl: null,
      type: "embed",
    });
    if (!defaultUrl) defaultUrl = src;
  }

  return { defaultUrl, servers, epHtml };
}

/**
 * Resolve a single serverId back to playable URL.
 */
export async function resolveServerUrl(serverId) {
  const payload = decodeServerId(serverId);
  if (!payload) throw new Error("Invalid serverId");

  if (payload.stream) return { url: payload.stream, type: "hls" };
  if (payload.embed) {
    // Optional: try refresh putarin stream
    if (payload.t === "putarin") {
      try {
        const cfg = await decryptPutarinConfig(payload.embed);
        const origin = cfg._origin || "https://putarin.xyz";
        const hlsRel =
          cfg.file ||
          (Array.isArray(cfg.sources) && cfg.sources[0]?.file) ||
          null;
        if (hlsRel) {
          const stream = hlsRel.startsWith("http")
            ? hlsRel
            : new URL(hlsRel, origin).href;
          return { url: payload.embed, stream, type: "embed" };
        }
      } catch {
        /* fall through */
      }
    }
    return { url: payload.embed, type: "embed" };
  }
  throw new Error("Server payload empty");
}
