import type { PreviewFieldType } from "@/lib/form-previewer-model";

const DEFAULT_TEXT_FONT_FILE = "Roboto-Regular.ttf";
const DEFAULT_SIGNATURE_FONT_FILE = "megastina.regular.ttf";
const PREVIEW_FONT_STYLE_ID = "previewer-font-face-style";
const PREVIEW_GOOGLE_FONT_LINK_ID = "previewer-google-font-link";

const LOCAL_PREVIEW_FONTS = [
  { family: "MegastinaPreview", file: "megastina.regular.ttf" },
  { family: "HighEmpathyPreview", file: "high-empathy.regular.ttf" },
  { family: "RoyaltyFreePreview", file: "royalty-free.regular.ttf" },
  { family: "TestimoniaPreview", file: "Testimonia.ttf" },
  { family: "TheSignaturePreview", file: "thesignature.regular.ttf" },
  { family: "ItaliannoPreview", file: "Italianno-Regular.ttf" },
  { family: "RobotoPreview", file: "Roboto-Regular.ttf" },
] as const;

export type ResolvedPreviewFont = {
  cssFamily: string;
  canvasFamily: string;
  fontWeight: "400";
};

const normalizeFontToken = (value?: string | null) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

export const resolvePreviewFont = (
  fieldType?: PreviewFieldType,
  fieldFont?: string | null,
): ResolvedPreviewFont => {
  const fallbackToken =
    fieldType === "signature"
      ? DEFAULT_SIGNATURE_FONT_FILE
      : DEFAULT_TEXT_FONT_FILE;
  const token = normalizeFontToken(fieldFont || fallbackToken);
  const isSignatureField = fieldType === "signature";

  if (token.includes("megastina")) {
    return {
      cssFamily: "MegastinaPreview, cursive",
      canvasFamily: "MegastinaPreview, cursive",
      fontWeight: "400",
    };
  }

  if (token.includes("high empathy") || token.includes("high-empathy")) {
    return {
      cssFamily: "HighEmpathyPreview, cursive",
      canvasFamily: "HighEmpathyPreview, cursive",
      fontWeight: "400",
    };
  }

  if (token.includes("royalty free") || token.includes("royalty-free")) {
    return {
      cssFamily: "RoyaltyFreePreview, cursive",
      canvasFamily: "RoyaltyFreePreview, cursive",
      fontWeight: "400",
    };
  }

  if (token.includes("testimonia")) {
    return {
      cssFamily: "TestimoniaPreview, cursive",
      canvasFamily: "TestimoniaPreview, cursive",
      fontWeight: "400",
    };
  }

  if (token.includes("the signature") || token.includes("thesignature")) {
    return {
      cssFamily: "TheSignaturePreview, cursive",
      canvasFamily: "TheSignaturePreview, cursive",
      fontWeight: "400",
    };
  }

  // Signature fields should always use a signature-style font family.
  // If metadata carries a generic text font token (e.g. Roboto), use Megastina fallback.
  if (isSignatureField) {
    return {
      cssFamily: "MegastinaPreview, cursive",
      canvasFamily: "MegastinaPreview, cursive",
      fontWeight: "400",
    };
  }

  if (token.includes("italianno")) {
    return {
      cssFamily: "ItaliannoPreview, cursive",
      canvasFamily: "ItaliannoPreview, cursive",
      fontWeight: "400",
    };
  }

  if (token.includes("roboto")) {
    return {
      cssFamily: "RobotoPreview, Roboto, sans-serif",
      canvasFamily: "RobotoPreview, Roboto, sans-serif",
      fontWeight: "400",
    };
  }

  if (token.includes("arial")) {
    return {
      cssFamily: "Arial, sans-serif",
      canvasFamily: "Arial, sans-serif",
      fontWeight: "400",
    };
  }

  if (token.includes("times")) {
    return {
      cssFamily: '"Times New Roman", serif',
      canvasFamily: '"Times New Roman", serif',
      fontWeight: "400",
    };
  }

  if (token.includes("ubuntu mono")) {
    return {
      cssFamily: '"Ubuntu Mono", monospace',
      canvasFamily: '"Ubuntu Mono", monospace',
      fontWeight: "400",
    };
  }

  return {
    cssFamily: "RobotoPreview, Roboto, sans-serif",
    canvasFamily: "RobotoPreview, Roboto, sans-serif",
    fontWeight: "400",
  };
};

export const ensurePreviewFontsLoaded = () => {
  if (typeof window === "undefined") return;

  if (!document.getElementById(PREVIEW_GOOGLE_FONT_LINK_ID)) {
    const link = document.createElement("link");
    link.id = PREVIEW_GOOGLE_FONT_LINK_ID;
    link.href =
      "https://fonts.googleapis.com/css2?family=Roboto:wght@400&family=Italianno&display=block";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }

  if (!document.getElementById(PREVIEW_FONT_STYLE_ID)) {
    const style = document.createElement("style");
    style.id = PREVIEW_FONT_STYLE_ID;
    style.textContent = LOCAL_PREVIEW_FONTS.map(
      ({ family, file }) => `
@font-face {
  font-family: "${family}";
  src: url("/fonts/${file}") format("truetype");
  font-weight: 400;
  font-style: normal;
  font-display: block;
}`,
    ).join("\n");
    document.head.appendChild(style);
  }

  if ("fonts" in document) {
    document.fonts.ready.catch(() => {
      // Font loading failure should not block preview rendering.
    });
  }
};

let sharedCanvas: HTMLCanvasElement | null = null;
let sharedCtx: CanvasRenderingContext2D | null = null;

const fitNoWrapCache = new Map<
  string,
  {
    fontSize: number;
    line: string;
    ascent: number;
    descent: number;
    height: number;
  }
>();

function getSharedContext(): CanvasRenderingContext2D | null {
  if (!sharedCanvas) {
    sharedCanvas = document.createElement("canvas");
    sharedCtx = sharedCanvas.getContext("2d");
  }
  return sharedCtx;
}

function measureTextWidth(
  text: string,
  fontSize: number,
  fontFamily: string,
): number {
  const ctx = getSharedContext();
  if (!ctx) return 0;
  ctx.font = `${fontSize}px ${fontFamily}`;
  return ctx.measureText(text).width;
}

function getFontMetricsAtSize(fontSize: number, fontFamily: string) {
  const ctx = getSharedContext();
  if (ctx) {
    ctx.font = `${fontSize}px ${fontFamily}`;
    const metrics = ctx.measureText("Ag");
    if (
      Number.isFinite(metrics.actualBoundingBoxAscent) &&
      Number.isFinite(metrics.actualBoundingBoxDescent)
    ) {
      const ascent = metrics.actualBoundingBoxAscent;
      const descent = -metrics.actualBoundingBoxDescent;
      return {
        ascent,
        descent,
        height: ascent - descent,
      };
    }
  }

  const ascent = fontSize * 0.8;
  const descent = -fontSize * 0.2;
  return {
    ascent,
    descent,
    height: ascent - descent,
  };
}

function wrapText({
  text,
  fontSize,
  fontFamily,
  maxWidth,
  zoom = 1,
}: {
  text: string;
  fontSize: number;
  fontFamily: string;
  maxWidth: number;
  zoom?: number;
}): string[] {
  const paragraphs = String(text ?? "").split(/\r?\n/);
  const lines: string[] = [];
  const measure = (s: string) =>
    measureTextWidth(s, fontSize, fontFamily) * zoom;

  const breakLongWord = (word: string): string[] => {
    const parts: string[] = [];
    let cur = "";
    for (const ch of word) {
      const next = cur + ch;
      if (cur && measure(next) > maxWidth) {
        parts.push(cur);
        cur = ch;
      } else {
        cur = next;
      }
    }
    if (cur) parts.push(cur);
    return parts;
  };

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) {
      lines.push("");
      continue;
    }

    const words = trimmed.split(/\s+/);
    let current = "";

    for (const w of words) {
      const candidate = current ? `${current} ${w}` : w;

      if (measure(candidate) <= maxWidth) {
        current = candidate;
        continue;
      }

      if (current) {
        lines.push(current);
        current = "";
      }

      if (measure(w) <= maxWidth) {
        current = w;
      } else {
        const broken = breakLongWord(w);
        for (let i = 0; i < broken.length; i++) {
          if (i === broken.length - 1) current = broken[i];
          else lines.push(broken[i]);
        }
      }
    }

    if (current) lines.push(current);
  }

  return lines;
}

function layoutWrappedBlock({
  text,
  fontSize,
  fontFamily,
  lineHeight,
  maxWidth,
  zoom = 1,
}: {
  text: string;
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  maxWidth: number;
  zoom?: number;
}) {
  const { ascent, descent } = getFontMetricsAtSize(fontSize, fontFamily);
  const lines = wrapText({ text, fontSize, fontFamily, maxWidth, zoom });
  const n = lines.length;
  const blockHeight = (n > 0 ? (n - 1) * lineHeight : 0) + (ascent - descent);
  return { lines, ascent, descent, blockHeight };
}

export function fitWrappedText({
  text,
  fontFamily,
  maxWidth,
  maxHeight,
  startSize,
  lineHeightMult = 1.2,
  zoom = 1,
}: {
  text: string;
  fontFamily: string;
  maxWidth: number;
  maxHeight: number;
  startSize: number;
  lineHeightMult?: number;
  zoom?: number;
}) {
  const fits = (size: number): boolean => {
    const lh = size * lineHeightMult;
    const { blockHeight } = layoutWrappedBlock({
      text,
      fontSize: size,
      fontFamily,
      lineHeight: lh,
      maxWidth,
      zoom,
    });
    return blockHeight <= maxHeight + 1e-6;
  };

  if (fits(startSize)) {
    const lh = startSize * lineHeightMult;
    const laid = layoutWrappedBlock({
      text,
      fontSize: startSize,
      fontFamily,
      lineHeight: lh,
      maxWidth,
      zoom,
    });
    return { fontSize: startSize, lineHeight: lh, ...laid };
  }

  let hi = startSize;
  let lo = startSize;
  while (!fits(lo)) {
    lo /= 2;
    if (lo < 0.1) break;
  }

  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2;
    if (fits(mid)) lo = mid;
    else hi = mid;
  }

  const bestSize = lo;
  const bestLineHeight = bestSize * lineHeightMult;
  const laid = layoutWrappedBlock({
    text,
    fontSize: bestSize,
    fontFamily,
    lineHeight: bestLineHeight,
    maxWidth,
    zoom,
  });
  return { fontSize: bestSize, lineHeight: bestLineHeight, ...laid };
}

export function fitNoWrapText({
  text,
  fontFamily,
  maxWidth,
  maxHeight,
  startSize,
}: {
  text: string;
  fontFamily: string;
  maxWidth: number;
  maxHeight: number;
  startSize: number;
}) {
  const line = String(text ?? "").replace(/\r?\n/g, " ");
  const cacheKey = `${line}|${fontFamily}|${maxWidth}|${maxHeight}|${startSize}`;
  if (fitNoWrapCache.has(cacheKey)) {
    return fitNoWrapCache.get(cacheKey)!;
  }

  const ctx = getSharedContext();

  const fits = (size: number): boolean => {
    if (!ctx) return false;
    ctx.font = `${size}px ${fontFamily}`;
    const w = ctx.measureText(line).width;
    const { height } = getFontMetricsAtSize(size, fontFamily);
    return w <= maxWidth + 1e-6 && height <= maxHeight + 1e-6;
  };

  if (fits(startSize)) {
    const { ascent, descent, height } = getFontMetricsAtSize(
      startSize,
      fontFamily,
    );
    const result = { fontSize: startSize, line, ascent, descent, height };
    fitNoWrapCache.set(cacheKey, result);
    return result;
  }

  let hi = startSize;
  let lo = startSize;
  while (!fits(lo)) {
    lo /= 2;
    if (lo < 0.1) break;
  }

  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2;
    if (fits(mid)) lo = mid;
    else hi = mid;
  }

  const bestSize = lo;
  const { ascent, descent, height } = getFontMetricsAtSize(
    bestSize,
    fontFamily,
  );
  const result = { fontSize: bestSize, line, ascent, descent, height };
  fitNoWrapCache.set(cacheKey, result);

  return result;
}
