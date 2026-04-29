import { ImageResponse } from "next/og";

export const contentType = "image/png";

export const size = {
  width: 1200,
  height: 630,
};

const logoUrl =
  "https://sofitech.ai/_next/static/media/sofi-ai-chat-support-automation-logo-vector.80ec9e4e.png";

export async function GET() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        padding: "58px",
        background:
          "radial-gradient(circle at 15% 15%, rgba(255,255,255,0.2), transparent 35%), radial-gradient(circle at 85% 80%, rgba(255,255,255,0.14), transparent 42%), linear-gradient(135deg, #0b1220 0%, #111827 50%, #030712 100%)",
        color: "white",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-140px",
          right: "-110px",
          width: "360px",
          height: "360px",
          borderRadius: "999px",
          background: "#35e3ca",
          opacity: 0.2,
          filter: "blur(24px)",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "24px",
          fontSize: 58,
          color: "white",
          fontWeight: 900,
          letterSpacing: "-0.045em",
        }}
      >
        <img
          src={logoUrl}
          alt="Sofi AI logo"
          width={92}
          height={92}
          style={{
            width: 92,
            height: 92,
            objectFit: "contain",
            borderRadius: 22,
            background: "rgba(17,24,39,0.65)",
            padding: "10px",
          }}
        />
        <span>BetterInternship</span>
        <span style={{ color: "#35e3ca" }}>x</span>
        <span>Sofi AI</span>
      </div>
    </div>,
    size,
  );
}
