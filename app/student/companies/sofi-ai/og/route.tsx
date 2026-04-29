import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

export const contentType = "image/png";

export const size = {
  width: 1200,
  height: 630,
};

const betterInternshipLogo = `data:image/png;base64,${fs
  .readFileSync(path.join(process.cwd(), "public/BetterInternshipLogo.png"))
  .toString("base64")}`;
const backgroundImage = `data:image/png;base64,${fs
  .readFileSync(path.join(process.cwd(), "public/bg.png"))
  .toString("base64")}`;
const spaceGroteskMediumUrl =
  "https://fonts.gstatic.com/s/spacegrotesk/v22/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj7aUUsj.ttf";
const spaceGroteskBoldUrl =
  "https://fonts.gstatic.com/s/spacegrotesk/v22/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj4PVksj.ttf";

export async function GET() {
  const [spaceGroteskMedium, spaceGroteskBold] = await Promise.all([
    fetch(spaceGroteskMediumUrl).then((response) => response.arrayBuffer()),
    fetch(spaceGroteskBoldUrl).then((response) => response.arrayBuffer()),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        color: "#061633",
        fontFamily: "Space Grotesk",
      }}
    >
      <img
        src={backgroundImage}
        alt=""
        width={1200}
        height={630}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1200,
          height: 630,
          objectFit: "cover",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          color: "#061633",
          gap: "18px",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "22px",
            fontSize: 58,
            fontWeight: 700,
            letterSpacing: 0,
          }}
        >
          <img
            src={betterInternshipLogo}
            alt="BetterInternship logo"
            width={92}
            height={92}
            style={{
              width: 92,
              height: 92,
              objectFit: "contain",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <span>BetterInternship</span>
            <span style={{ color: "#1787ff", marginRight: "14px" }}>x </span>
            <span>Sofi AI</span>
          </div>
        </div>
        <div
          style={{
            color: "#6b7280",
            fontSize: 34,
            fontWeight: 500,
            letterSpacing: 0,
          }}
        >
          Land an internship 10x faster
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Space Grotesk",
          data: spaceGroteskMedium,
          weight: 500,
          style: "normal",
        },
        {
          name: "Space Grotesk",
          data: spaceGroteskBold,
          weight: 700,
          style: "normal",
        },
      ],
    },
  );
}
