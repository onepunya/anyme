/**
 * Lightweight fetch helper for Otakudesu scrapers.
 * - Rotates mirrors
 * - Sensible browser-like headers
 * - Short timeout (Vercel-friendly)
 * - POST form support (Animestream ajax)
 */

const MIRRORS = [
  "https://otakudesu.blog",
  "https://otakudesu.best",
  "https://ww2.otakudesu.biz",
];

const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
};

let activeBase = MIRRORS[0];

export function getBase() {
  return activeBase;
}

export function setBase(url) {
  activeBase = url.replace(/\/$/, "");
}

function isCloudflareBlock(text) {
  return (
    text.includes("cf-error-details") ||
    text.includes("Attention Required") ||
    text.includes("Just a moment") ||
    text.includes("cf-browser-verification")
  );
}

/**
 * Fetch HTML with mirror rotation on failure.
 */
export async function fetchHtml(pathOrUrl, opts = {}) {
  const timeout = opts.timeout ?? 10000;
  const tried = new Set();

  const candidates = pathOrUrl.startsWith("http")
    ? [pathOrUrl]
    : MIRRORS.map(
        (m) =>
          m.replace(/\/$/, "") +
          (pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`)
      );

  let lastError = null;

  for (const url of candidates) {
    if (tried.has(url)) continue;
    tried.add(url);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          ...DEFAULT_HEADERS,
          Referer: opts.referer || activeBase + "/",
          ...(opts.headers || {}),
        },
        signal: controller.signal,
        redirect: "follow",
        cache: "no-store",
      });

      clearTimeout(timer);

      if (!res.ok) {
        lastError = new Error(`HTTP ${res.status} for ${url}`);
        continue;
      }

      const text = await res.text();
      if (isCloudflareBlock(text)) {
        lastError = new Error(`Cloudflare challenge on ${url}`);
        continue;
      }

      try {
        const u = new URL(url);
        setBase(u.origin);
      } catch {}

      return text;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
    }
  }

  throw lastError || new Error("All Otakudesu mirrors failed");
}

/**
 * POST application/x-www-form-urlencoded, return text or parsed JSON.
 */
export async function postForm(url, data = {}, opts = {}) {
  const timeout = opts.timeout ?? 10000;
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined && v !== null) body.set(k, String(v));
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        ...DEFAULT_HEADERS,
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        Referer: opts.referer || activeBase + "/",
        Origin: activeBase,
        ...(opts.headers || {}),
      },
      body: body.toString(),
      signal: controller.signal,
      redirect: "follow",
      cache: "no-store",
    });
    clearTimeout(timer);
    const text = await res.text();
    if (!res.ok) throw new Error(`POST ${res.status}: ${text.slice(0, 120)}`);
    if (opts.json) {
      try {
        return JSON.parse(text);
      } catch {
        return { raw: text };
      }
    }
    return text;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

export { MIRRORS, DEFAULT_HEADERS };
