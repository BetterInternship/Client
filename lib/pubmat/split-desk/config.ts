import type { PosterRenderSettings } from "../theme-types";

/** Same layout tokens for every preset. Gaps are CSS element gaps, not ink gaps. */
export const splitDeskConfig = {
  id: "split-desk",
  canvas: { width: 1080, height: 1080 },
  fontFamily: "Inter",
  colors: {
    text: "#00113F",
    secondary: "#515B82",
    accent: "#075CFF",
    iconTile: "rgba(207,227,255,0.86)",
    divider: "rgba(78,126,230,0.55)",
  },
  layout: {
    paddingTop: 184,
    paddingBottom: 56,
    paddingX: 72,
    leftWidth: 516,
    rightWidth: 392,
    columnGap: 28,
    rightPaddingLeft: 28,
    dividerWidth: 1,
    identityGap: 20,
    descriptionGap: 28,
    detailsToActionGap: 24,
    detailGap: 24,
    detailIconGap: 18,
    detailLabelGap: 6,
    qrToFooterGap: 16,
    footerLineGap: 2,
    iconTileSize: 88,
    iconSize: 44,
    iconTileRadius: 18,
  },
  composition: {
    vertical: "center the natural-height two-column row inside canvas padding",
    horizontal: "left aligned; equal column top edges",
    identity: ["logo-or-company", "title"],
    narrative: ["identity", "optional-description"],
    sidebar: ["optional-details", "qr-and-footer"],
    absentContent: "omit element and its gap; no placeholder/min-height",
    action: "normal flow after details; never independently y-positioned",
    groups: [
      {
        id: "identity-group",
        contents: ["logo-or-company", "title"],
        align: "left",
        gap: 20,
        column: "left",
      },
      {
        id: "description",
        contents: ["optional-description"],
        align: "left",
        gapBefore: 28,
        column: "left",
        absent: "omit and remove gap",
      },
      {
        id: "details",
        contents: [
          "optional-location",
          "optional-work-mode",
          "optional-allowance",
        ],
        align: "left",
        gap: 24,
        column: "right",
        absent: "omit group and following gap",
      },
      {
        id: "action",
        contents: ["transparent-qr", "two-line-footer"],
        align: "center",
        gap: 16,
        column: "right",
        gapBefore: "24 only when details exists",
      },
    ],
  },
  text: {
    company: {
      initial: 34,
      min: 28,
      weight: 600,
      lineHeight: 1.05,
      maxLines: 2,
    },
    title: {
      initial: 112,
      // 80px rejects common listing words such as "Development" in the 516px column.
      min: 72,
      weight: 700,
      lineHeight: 1,
      maxLines: 3,
      adjustmentDivisor: 1,
    },
    description: {
      initial: 32,
      min: 26,
      weight: 400,
      lineHeight: 1.2,
      maxLines: 5,
      adjustmentDivisor: 5,
    },
    detailLabel: {
      initial: 25,
      min: 22,
      weight: 400,
      lineHeight: 1.1,
      maxLines: 1,
    },
    detailValue: {
      initial: 30,
      min: 24,
      weight: 700,
      lineHeight: 1.1,
      maxLines: 2,
    },
    footer: {
      initial: 31,
      min: 29,
      weight: 400,
      lineHeight: 1.05,
      maxLines: 1,
    },
    brand: { initial: 35, min: 32, weight: 400, lineHeight: 1.05, maxLines: 1 },
    fit: "shared adjustment loop, then reject; never clamp, clip or ellipsize",
    lineHeightPolicy:
      "Keep each block's configured unitless line-height while shrinking glyphs; natural block heights and the fixed CSS gaps then shrink together. Static marker limits still enforce maximum lines at every adjustment.",
    titleAccent:
      "second whitespace-delimited word; both colors share size/weight",
    titleWordGapEm: 0.12,
    adjustment: { min: 0, max: 40, step: 2 },
  },
  logo: { width: 480, height: 160, trim: true, upscale: true },
  background: {
    fit: "cover",
    defaultPosition: { x: 0.5, y: 0.5, scale: 1 },
    reposition: false,
    zoom: false,
    area: "fixed 1080x1080 canvas",
    presetWash: "none; use clean supplied preset lighting",
    uploadWash: {
      enabled: true,
      color: "#FFFFFF",
      direction: "left-to-right",
      css: "linear-gradient(90deg, rgba(255,255,255,.94) 0%, rgba(255,255,255,.90) 58%, rgba(255,255,255,.96) 100%)",
      detection:
        "data.backgroundImage starts with data: (existing resolver convention)",
    },
  },
  qr: {
    requestedSize: 320,
    maxSuppliedSize: 363,
    background: "transparent",
    padding: 0,
    card: false,
    source:
      "assets.qr from shared posterQr; template does not regenerate or rescale it",
    align: "center within right-column content",
  },
  footer: {
    lines: ["Scan to apply via", "BetterInternship"],
    align: "center beneath QR",
    brandColor: "#075CFF",
  },
} as const;

/** Consumed directly by the existing renderFittedPoster/layoutFits pipeline. */
export const splitDeskRenderSettings: PosterRenderSettings = {
  logo: splitDeskConfig.logo,
  qrSize: splitDeskConfig.qr.requestedSize,
  limits: {
    composition: {
      minTop: 184,
      maxBottom: 1024,
      maxWidth: 936,
      maxHeight: 840,
    },
    "left-column": { maxWidth: 516, maxBottom: 1024 },
    "right-column": { maxWidth: 392, maxBottom: 1024 },
    company: { maxHeight: Math.ceil(34 * 1.05) * 2, maxWidth: 516 },
    title: { maxHeight: 112 * 3 + 0.1, maxWidth: 516 },
    "title-word": { maxWidth: 516 },
    description: { maxHeight: Math.ceil(32 * 1.2) * 5, maxWidth: 516 },
    "detail-label": { maxHeight: Math.ceil(25 * 1.1), maxWidth: 257 },
    "detail-value": { maxHeight: 30 * 1.1 * 2 + 0.1, maxWidth: 257 },
    qr: { maxHeight: 363, maxWidth: 363 },
    "footer-line": { maxHeight: Math.ceil(31 * 1.05), maxWidth: 363 },
    "brand-line": { maxHeight: Math.ceil(35 * 1.05), maxWidth: 363 },
  },
};

export const splitDeskBackgrounds = [
  {
    id: "01-sky-desk",
    label: "Sky desk",
    src: "/pubmat/split-desk/01-sky-desk.png",
  },
  {
    id: "02-blueprint",
    label: "Blueprint",
    src: "/pubmat/split-desk/02-blueprint.png",
  },
  {
    id: "03-paper-collage",
    label: "Paper collage",
    src: "/pubmat/split-desk/03-paper-collage.png",
  },
] as const;
