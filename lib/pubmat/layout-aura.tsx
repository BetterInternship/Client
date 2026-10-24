import type { PubmatData } from "./params";
import { LOGO_DATA_URI } from "./logo";
import { fitTitle, wrapLines } from "./fit";
import { clamp, detailRows, svgUri, type Qr } from "./parts";

/**
 * "Aura": a loud, gradient-heavy square that doesn't follow the BetterInternship
 * look. Mesh-style glows over a deep violet, a title in Unbounded (a wide,
 * rounded display face), sticker-style labels and frosted detail cards. Square
 * only (1080×1080).
 *
 * Text is Unbounded with Inter behind it for anything Unbounded lacks. Like the
 * other layouts, sizes come from fit.ts's width tables because satori can't
 * measure text.
 */

const SIZE = 1080;
const MARGIN = 64;
const FONT = "Unbounded, Inter";

const PINK = "#ff3d9a";
const ORANGE = "#ff8a3d";
const VIOLET = "#7a3dff";
const CYAN = "#3de0ff";
const LIME = "#c8ff3d";
const NIGHT = "#12052b"; // text on the bright stickers

const glow = (x: number, y: number, color: [number, number, number]) => {
  const [r, g, b] = color;
  return `radial-gradient(circle at ${x}% ${y}%, rgba(${r}, ${g}, ${b}, 0.95) 0%, rgba(${r}, ${g}, ${b}, 0) 46%)`;
};

const BACKDROP = [
  glow(8, 6, [255, 61, 154]),
  glow(96, 30, [122, 61, 255]),
  glow(86, 100, [255, 138, 61]),
  glow(2, 88, [61, 224, 255]),
  "linear-gradient(160deg, #1c0642 0%, #0b1040 100%)",
].join(", ");

const sparkle = (fill: string) =>
  svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 0 C54 30 70 46 100 50 C70 54 54 70 50 100 C46 70 30 54 0 50 C30 46 46 30 50 0 Z" fill="${fill}"/></svg>`,
  );

function Sparkle({
  x,
  y,
  size,
  fill = "#ffffff",
  opacity = 1,
  rotate = 0,
}: {
  x: number;
  y: number;
  size: number;
  fill?: string;
  opacity?: number;
  rotate?: number;
}) {
  return (
    <img
      src={sparkle(fill)}
      alt=""
      width={size}
      height={size}
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity,
        transform: `rotate(${rotate}deg)`,
      }}
    />
  );
}

/** A bright, slightly tilted label. */
function Sticker({
  children,
  height,
  fontSize,
  padX,
  rotate,
  from = LIME,
  to = CYAN,
}: {
  children: React.ReactNode;
  height: number;
  fontSize: number;
  padX: number;
  rotate: number;
  from?: string;
  to?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height,
        padding: `0 ${padX}px`,
        borderRadius: height / 2,
        backgroundImage: `linear-gradient(90deg, ${from}, ${to})`,
        color: NIGHT,
        fontSize,
        fontWeight: 900,
        letterSpacing: fontSize * 0.06,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      {children}
    </div>
  );
}

const ROW_COLORS = [CYAN, LIME, ORANGE, PINK];

/** Shorter values get the bigger type; long ones step down and may take two lines. */
const valueSize = (value: string) =>
  value.length <= 16 ? 30 : value.length <= 22 ? 26 : 21;

/** Title ceiling by length — Unbounded is wide, so these are well under Inter's. */
const ladder = (title: string) => {
  const n = title.length;
  return n <= 8
    ? 120
    : n <= 14
      ? 104
      : n <= 22
        ? 88
        : n <= 34
          ? 72
          : n <= 50
            ? 58
            : 46;
};

export function AuraLayout({ data, qr }: { data: PubmatData; qr: Qr }) {
  const rows = detailRows(data);

  const head = { top: 170, width: SIZE - 2 * MARGIN, height: 340 };
  const content = { top: 540, height: 410 };
  const list = { width: 566 };
  // With no details to sit beside, the QR takes the middle.
  const frame = {
    left: rows.length ? SIZE - MARGIN - 348 : (SIZE - 348) / 2,
    size: 348,
    border: 8,
  };
  // The details are centred against the QR, not the whole content area.
  const listTop = content.top + (frame.size - content.height) / 2;
  // Four rows with long values would otherwise crowd the footer.
  const dense = rows.length >= 4 && rows.some((row) => row.value.length > 22);

  // The company line gives first, same as the classic layout: the title
  // shrinks until it and the line under it both fit the head box.
  const companyFont = data.company.length <= 20 ? 42 : 32;
  const companyGap = 22;
  const companyLines = data.company
    ? Math.min(
        2,
        wrapLines(
          `at ${data.company}`,
          companyFont,
          700,
          head.width * 0.98,
          -0.01 * companyFont,
          "unbounded",
        ),
      )
    : 0;
  const companyHeight = companyLines
    ? companyGap + companyLines * companyFont * 1.1
    : 0;
  const size = fitTitle(data.title, {
    width: head.width,
    maxLines: 3,
    maxSize: ladder(data.title),
    minSize: 34,
    maxHeight: head.height - companyHeight,
    tracking: -0.02,
    face: "unbounded",
    weight: 900,
  });
  const companyShown = Math.min(companyFont, Math.round(size * 0.6));

  // Four modules of quiet zone on every side of the code.
  const inner = frame.size - 2 * frame.border;
  const qrSize = Math.floor((inner * qr.modules) / (qr.modules + 8));

  return (
    <div
      style={{
        display: "flex",
        position: "relative",
        width: SIZE,
        height: SIZE,
        overflow: "hidden",
        fontFamily: FONT,
        color: "#ffffff",
        backgroundImage: BACKDROP,
      }}
    >
      <Sparkle x={930} y={58} size={74} fill="#ffffff" rotate={12} />
      <Sparkle x={868} y={128} size={32} fill={LIME} />
      <Sparkle x={12} y={466} size={36} fill={CYAN} opacity={0.9} />
      <Sparkle x={612} y={474} size={28} fill="#ffffff" opacity={0.8} />
      <Sparkle x={1004} y={954} size={44} fill="#ffffff" opacity={0.9} />

      <div
        style={{
          position: "absolute",
          left: MARGIN - 6,
          top: 58,
          display: "flex",
        }}
      >
        <Sticker height={64} fontSize={26} padX={34} rotate={-4}>
          WE&apos;RE HIRING
        </Sticker>
      </div>

      {/* title, then who's hiring */}
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          top: head.top,
          width: head.width,
          height: head.height,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            ...clamp(3),
            fontSize: size,
            fontWeight: 900,
            // Below ~1.1 the line clamp's overflow:hidden shears descenders.
            lineHeight: 1.1,
            letterSpacing: -0.02 * size,
            textShadow: `0 ${Math.round(size * 0.06)}px 0 rgba(255, 61, 154, 0.6)`,
          }}
        >
          {data.title}
        </div>
        {data.company ? (
          <div
            style={{
              ...clamp(2),
              marginTop: companyGap,
              fontSize: companyShown,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: -0.01 * companyShown,
              color: LIME,
            }}
          >
            {`at ${data.company}`}
          </div>
        ) : null}
      </div>

      {/* details, as frosted cards */}
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          top: listTop,
          width: list.width,
          height: content.height,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {rows.map((row, i) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: i === 0 ? 0 : dense ? 10 : 14,
              padding: dense ? "12px 26px 14px" : "16px 26px 18px",
              borderRadius: 26,
              backgroundColor: "rgba(255, 255, 255, 0.11)",
              border: "2px solid rgba(255, 255, 255, 0.28)",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 15,
                fontWeight: 500,
                letterSpacing: 15 * 0.14,
                textTransform: "uppercase",
                color: ROW_COLORS[i % ROW_COLORS.length],
              }}
            >
              {row.label}
            </div>
            <div
              style={{
                ...clamp(2),
                marginTop: 6,
                fontSize: valueSize(row.value),
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: -0.01 * valueSize(row.value),
              }}
            >
              {row.value}
            </div>
          </div>
        ))}
      </div>

      {/* the QR, in a gradient frame, with a sticker over its corner */}
      <div
        style={{
          position: "absolute",
          left: frame.left,
          top: content.top,
          display: "flex",
          width: frame.size,
          height: frame.size,
          padding: frame.border,
          borderRadius: 48,
          backgroundImage: `linear-gradient(135deg, ${PINK} 0%, ${ORANGE} 55%, ${LIME} 100%)`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: inner,
            height: inner,
            borderRadius: 40,
            backgroundColor: "#ffffff",
          }}
        >
          <img src={qr.src} alt="" width={qrSize} height={qrSize} />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: frame.left + 22,
          top: content.top + frame.size - 26,
          display: "flex",
        }}
      >
        <Sticker
          height={54}
          fontSize={21}
          padX={26}
          rotate={-3}
          from={VIOLET}
          to={PINK}
        >
          <span style={{ color: "#ffffff" }}>SCAN TO APPLY</span>
        </Sticker>
      </div>

      {/* brand */}
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          top: 982,
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: "#ffffff",
          }}
        >
          <img src={LOGO_DATA_URI} alt="" width={36} height={36} />
        </div>
        <div
          style={{
            display: "flex",
            marginLeft: 16,
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: -0.01 * 24,
          }}
        >
          BetterInternship
        </div>
      </div>
    </div>
  );
}
