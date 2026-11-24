import { ImageResponse } from "next/og";

export const alt = "Anyme - Nonton Anime & Baca Manga Sub Indo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const chip = {
  display: "flex",
  padding: "10px 26px",
  border: "2px solid #e8761a",
  color: "#e8761a",
  fontSize: 30,
  marginRight: 18,
};

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 90,
          background: "linear-gradient(135deg, #0f1115 0%, #1a1410 60%, #3a1d07 100%)",
          color: "#f2ece4",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: 16, height: 110, background: "#e8761a", marginRight: 32 }} />
          <div style={{ display: "flex", fontSize: 130, fontWeight: 900, letterSpacing: 10 }}>
            ANY<span style={{ color: "#e8761a" }}>ME</span>
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 34, fontSize: 44, color: "#c4b8a8" }}>
          Nonton anime & baca manga sub Indonesia
        </div>
        <div style={{ display: "flex", marginTop: 56 }}>
          <div style={chip}>ANIME</div>
          <div style={chip}>MANGA</div>
          <div style={chip}>GRATIS</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
