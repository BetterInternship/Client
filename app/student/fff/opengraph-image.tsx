import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "56px",
        background:
          "linear-gradient(135deg, #f7f7f7 0%, #fefefe 45%, #ececec 100%)",
        color: "#0a0a0a",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        <span>BetterInternship</span>
        <span style={{ opacity: 0.45 }}>x</span>
        <span>Founders For Founders</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            width: "fit-content",
            gap: "8px",
            border: "1px solid #111111",
            borderRadius: "999px",
            background: "#ffffff",
            padding: "8px 14px",
            fontSize: 18,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          <span>⚡</span>
          <span>Super Listing</span>
        </div>

        <div
          style={{
            fontSize: 78,
            lineHeight: 0.9,
            letterSpacing: "-0.04em",
            fontWeight: 900,
            textTransform: "uppercase",
          }}
        >
          Scout. Network. Scale.
        </div>

        <div
          style={{
            border: "1px solid #111111",
            background: "#ffffff",
            width: "fit-content",
            padding: "10px 14px",
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Startup Accelerator Intern
        </div>
      </div>

      <div
        style={{
          fontSize: 22,
          color: "#2d2d2d",
          letterSpacing: "-0.01em",
        }}
      >
        Scout top AI-native builders, network deeply, and help scale the next
        startup accelerator.
      </div>
    </div>,
    size,
  );
}
