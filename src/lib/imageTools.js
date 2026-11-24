// Ubah gambar apa pun jadi kotak WebP/PNG kecil di browser (tanpa library).
// mode "contain": seluruh gambar terlihat di kanvas transparan (cocok untuk stiker)
// mode "cover"  : dipotong tengah memenuhi kotak (cocok untuk avatar)
// Catatan: GIF animasi hanya diambil frame pertamanya.
export async function imageToSquare(file, { size = 256, mode = "contain", maxBytes = 100 * 1024 } = {}) {
  if (!file || !file.type.startsWith("image/")) throw new Error("File harus berupa gambar");
  if (file.size > 15 * 1024 * 1024) throw new Error("Gambar terlalu besar (maks 15 MB)");

  let bmp;
  try {
    bmp = await createImageBitmap(file);
  } catch {
    throw new Error("Gambar tidak bisa dibaca");
  }

  const toBlob = (canvas, q) =>
    new Promise((res) => canvas.toBlob((b) => res(b), "image/webp", q));

  // coba ukuran penuh, lalu perkecil kalau masih melebihi batas
  for (const scale of [1, 0.75, 0.5]) {
    const s = Math.round(size * scale);
    const canvas = document.createElement("canvas");
    canvas.width = s;
    canvas.height = s;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingQuality = "high";

    const ratio = mode === "cover" ? Math.max(s / bmp.width, s / bmp.height) : Math.min(s / bmp.width, s / bmp.height);
    const w = bmp.width * ratio;
    const h = bmp.height * ratio;
    ctx.drawImage(bmp, (s - w) / 2, (s - h) / 2, w, h);

    for (const q of [0.9, 0.8, 0.65, 0.5]) {
      const blob = await toBlob(canvas, q);
      if (blob && blob.size <= maxBytes) return blob;
    }
  }
  bmp.close?.();
  throw new Error("Gambar terlalu berat, coba gambar lain");
}

export async function uploadMedia(kind, blob) {
  const res = await fetch(`/api/media?kind=${kind}`, {
    method: "POST",
    headers: { "Content-Type": blob.type || "image/webp" },
    body: blob,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Gagal mengunggah");
  return data.id;
}
