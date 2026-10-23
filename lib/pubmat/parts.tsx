import type { PubmatData } from "./params";
import { LOGO_DATA_URI } from "./logo";
import type { qrCode } from "./qr";

/**
 * Pieces the pubmat layouts share: the palette, the decorative shapes and the
 * few blocks (pill, details, QR frame, brand) that every layout draws, each
 * taking its sizes so a story and a LinkedIn card can scale them differently.
 * Rendered in the browser by satori, which can't measure text — sizes come from
 * character counts, with line clamps as the backstop.
 */

export const ACCENT = "#0b5493";
export const PILL = "#cddbe7"; // the accent at 26% on white
export const INK = "#0c1220";
export const MUTED = "#6c779e";
export const DIVIDER = "#e4e6ed";

export type Qr = ReturnType<typeof qrCode>;

const logo = LOGO_DATA_URI;

export const svgUri = (svg: string) => `data:image/svg+xml;base64,${btoa(svg)}`;

/**
 * The corner shapes. The top-right one is fixed to the top of the canvas; the
 * bottom-left one is drawn for a 1080-high canvas and slid down to meet the
 * bottom of taller ones.
 */
export function cornerShapes(
  width: number,
  height: number,
  { bottomLeft = true }: { bottomLeft?: boolean } = {},
) {
  const dy = height - 1080;
  const bl = `M101 ${1055.5 + dy} L-84.8 ${900 + dy} L-300 ${900 + dy} L-300 ${1300 + dy} L-103.8 ${1300 + dy} Z`;
  return svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><g fill="${ACCENT}" stroke="${ACCENT}" stroke-width="40" stroke-linejoin="round"><path d="M947 94.1 L1104 -50 L1300 -50 L1300 450 L1273 450 Z"/>${bottomLeft ? `<path d="${bl}"/>` : ""}</g></svg>`,
  );
}

/** A small corner for the landscape card, which has no room for the big one. */
export function landscapeCorner(width: number, height: number) {
  return svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><path d="M${width - 150} -20 L${width + 20} -20 L${width + 20} 150 Z" fill="${ACCENT}" stroke="${ACCENT}" stroke-width="24" stroke-linejoin="round"/></svg>`,
  );
}

function burst(side: "left" | "right") {
  const flip =
    side === "right" ? ' transform="translate(46 0) scale(-1 1)"' : "";
  return svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 84"><g${flip} stroke="${ACCENT}" stroke-width="5.4" stroke-linecap="round"><line x1="21" y1="5" x2="41.5" y2="18"/><line x1="5" y1="40.6" x2="37.4" y2="40.6"/><line x1="21" y1="76.3" x2="41.5" y2="63.3"/></g></svg>`,
  );
}

/**
 * The size a title of this length is set at when there's room — shorter titles
 * bigger. `scale` is the layout's size relative to the 1080 square. This is
 * only the ceiling: whether it actually fits is for fitTitle() or titleSize().
 */
export function ladderSize(title: string, scale = 1) {
  const n = title.length;
  const base =
    n <= 14
      ? 124
      : n <= 24
        ? 104
        : n <= 36
          ? 88
          : n <= 52
            ? 70
            : n <= 72
              ? 60
              : 52;
  return Math.round(base * scale);
}

/**
 * The ladder size, capped so the longest word still fits the line —
 * "Cybersecurity" at the biggest size would run off the card. Doesn't look at
 * how many lines the title takes; the story and landscape layouts clamp that.
 */
export function titleSize(title: string, width: number, scale = 1) {
  const longestWord = Math.max(...title.split(" ").map((w) => w.length));
  const byWord = Math.floor(width / (0.66 * longestWord));
  return Math.max(
    Math.round(44 * scale),
    Math.min(ladderSize(title, scale), byWord),
  );
}

export const companySize = (company: string, scale = 1) =>
  Math.round((company.length <= 24 ? 50 : 40) * scale);

// satori's own `lineClamp`. The `-webkit-box` + WebkitLineClamp spelling in
// top-og-image.tsx is accepted by the bundled satori but doesn't truncate.
export const clamp = (lines: number) =>
  ({ display: "block", lineClamp: lines }) as React.CSSProperties;

export function detailRows(data: PubmatData) {
  return [
    { label: "Location", value: data.location },
    { label: "Work setup", value: data.setup },
    { label: "Pay", value: data.pay },
    { label: "Apply by", value: data.deadline },
  ].filter((row): row is { label: string; value: string } => !!row.value);
}

/** "WE'RE HIRING", with burst lines either side. */
export function Pill({
  height = 70,
  fontSize = 30,
  padX = 44,
}: {
  height?: number;
  fontSize?: number;
  padX?: number;
}) {
  const burstH = Math.round(height * 1.2);
  const burstW = Math.round((burstH * 46) / 84);
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <img src={burst("left")} alt="" width={burstW} height={burstH} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height,
          padding: `0 ${padX}px`,
          margin: "0 9px 0 10px",
          borderRadius: height / 2,
          backgroundColor: PILL,
          fontSize,
          fontWeight: 800,
          letterSpacing: fontSize * 0.05,
        }}
      >
        WE&apos;RE HIRING
      </div>
      <img src={burst("right")} alt="" width={burstW} height={burstH} />
    </div>
  );
}

/** Label-over-value rows, each behind an accent dot. */
export function DetailsList({
  rows,
  label = 22,
  value = 38,
  valueLong = 32,
  longAt = 22,
  gap = 26,
  dot = 23,
  dotGap = 33,
}: {
  rows: { label: string; value: string }[];
  label?: number;
  value?: number;
  valueLong?: number;
  /** Values longer than this are set at `valueLong`, so they wrap less. */
  longAt?: number;
  gap?: number;
  dot?: number;
  dotGap?: number;
}) {
  // Centres the dot on the value line rather than on the label above it.
  const dotTop = Math.round(label * 1.2 + 2 + (value * 1.15) / 2 - dot / 2);
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {rows.map((row, i) => {
        const size = row.value.length > longAt ? valueLong : value;
        return (
          <div
            key={row.label}
            style={{
              display: "flex",
              alignItems: "flex-start",
              marginTop: i === 0 ? 0 : gap,
            }}
          >
            <div
              style={{
                display: "flex",
                flexShrink: 0,
                width: dot,
                height: dot,
                borderRadius: 999,
                backgroundColor: ACCENT,
                marginTop: dotTop,
                marginRight: dotGap,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  fontSize: label,
                  fontWeight: 400,
                  letterSpacing: label * 0.07,
                  textTransform: "uppercase",
                  color: MUTED,
                }}
              >
                {row.label}
              </div>
              <div
                style={{
                  ...clamp(2),
                  marginTop: 2,
                  fontSize: size,
                  fontWeight: 700,
                  lineHeight: 1.15,
                  letterSpacing: -0.02 * size,
                }}
              >
                {row.value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** The QR in its accent frame; `style` positions it. */
export function QrFrame({
  qr,
  size,
  border = 10,
  radius = 16,
  style,
}: {
  qr: Qr;
  size: number;
  border?: number;
  radius?: number;
  style?: React.CSSProperties;
}) {
  const inner = size - 2 * border;
  // Four modules of quiet zone on every side of the code.
  const qrSize = Math.floor((inner * qr.modules) / (qr.modules + 8));
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        border: `${border}px solid ${ACCENT}`,
        borderRadius: radius,
        backgroundColor: "#ffffff",
        ...style,
      }}
    >
      <img src={qr.src} alt="" width={qrSize} height={qrSize} />
    </div>
  );
}

export function Brand({
  logoSize = 46,
  fontSize = 32,
}: {
  logoSize?: number;
  fontSize?: number;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <img src={logo} alt="" width={logoSize} height={logoSize} />
      <div
        style={{
          display: "flex",
          marginLeft: Math.round(logoSize * 0.3),
          fontSize,
          fontWeight: 800,
          letterSpacing: -0.02 * fontSize,
        }}
      >
        BetterInternship
      </div>
    </div>
  );
}

/** The canvas every layout draws on. */
export function Canvas({
  width,
  height,
  children,
}: {
  width: number;
  height: number;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        position: "relative",
        width,
        height,
        backgroundColor: "#ffffff",
        overflow: "hidden",
        fontFamily: "Inter",
        color: INK,
      }}
    >
      {children}
    </div>
  );
}

export function Corners({
  src,
  width,
  height,
}: {
  src: string;
  width: number;
  height: number;
}) {
  return (
    <img
      src={src}
      alt=""
      width={width}
      height={height}
      style={{ position: "absolute", left: 0, top: 0 }}
    />
  );
}
