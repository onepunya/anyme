// URL publik situs — dipakai untuk gambar preview saat link dibagikan (WhatsApp, Telegram, Discord, dll).
// Set NEXT_PUBLIC_SITE_URL di Vercel, contoh: https://anyme.vercel.app
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/+$/, "");

export const SITE_NAME = "Anyme";

const cut = (s, n = 180) => {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
};

// Metadata lengkap (title, Open Graph, Twitter card). `image` boleh URL absolut;
// kalau kosong dipakai gambar bawaan situs (/opengraph-image).
export function shareMeta({ title, description, image }) {
  const desc = cut(description) || "Nonton anime dan baca manga subtitle Indonesia gratis.";
  const img = image && /^https?:\/\//.test(image) ? image : `${SITE_URL}/opengraph-image`;
  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      type: "website",
      siteName: SITE_NAME,
      locale: "id_ID",
      images: [{ url: img, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description: desc, images: [img] },
  };
}
