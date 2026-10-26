import { create } from "qrcode";
import { PUBMAT_QR, themeColors, type PubmatTheme } from "./themes";
import { PubmatFitError, validateRoleUrl } from "./theme-layout";

export const posterSvg = (content: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">${content}</svg>`;

/** Approved stronger footer wash: broad feathered ellipse, never a CTA panel. */
export function footerReadingField(theme: PubmatTheme) {
  const { wash, footerOpacity } = themeColors(theme);
  return `<defs><radialGradient id="footer-reading-field"><stop offset="0" stop-color="${wash}" stop-opacity="${footerOpacity}"/><stop offset="55%" stop-color="${wash}" stop-opacity="${footerOpacity * 0.9}"/><stop offset="100%" stop-color="${wash}" stop-opacity="0"/></radialGradient></defs><ellipse cx="300" cy="968" rx="390" ry="130" fill="url(#footer-reading-field)"/>`;
}

/** Integer-aligned modules inside the exact approved 330px white footprint. */
export function themeQr(link: string) {
  validateRoleUrl(link);
  const qr = create(link, { errorCorrectionLevel: "L" });
  const n = qr.modules.size,
    scale = Math.floor(PUBMAT_QR.size / (n + 8));
  if (scale < 3)
    throw new PubmatFitError(
      "link",
      "This listing URL is too long for a readable QR. Use a shorter canonical listing link.",
    );
  const inset = (PUBMAT_QR.size - (n + 8) * scale) / 2 + 4 * scale;
  let d = "";
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      if (!qr.modules.data[y * n + x]) continue;
      let run = 1;
      while (x + run < n && qr.modules.data[y * n + x + run]) run++;
      d += `M${PUBMAT_QR.x + inset + x * scale} ${PUBMAT_QR.y + inset + y * scale}h${run * scale}v${scale}h-${run * scale}z`;
      x += run - 1;
    }
  return `<rect x="674" y="674" width="330" height="330" fill="#FFFFFF"/><path d="${d}" fill="#061D32" shape-rendering="crispEdges"/>`;
}
