import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "BetterInternship";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 48,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "40px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 64, fontWeight: "bold", marginBottom: 20 }}>
        BetterInternship
      </div>
      <div style={{ fontSize: 36, opacity: 0.9, marginBottom: 30 }}>
        Internships 10x faster.
      </div>
    </div>,
    {
      ...size,
    },
  );
}
