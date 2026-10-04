import { pickForeground } from "@/lib/utils/contrast";

/** Perceptual colour ramps: a university hue, not its raw saturation, sets
 * the mood. All output is gamut-mapped sRGB hex for consistent rendering. */
function toOklch(hex: string) {
  const [r, g, b] = [1, 3, 5].map((start) => {
    const c = parseInt(hex.slice(start, start + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { lightness, chroma: Math.hypot(a, bb), hue: Math.atan2(bb, a) };
}

function fromOklch(lightness: number, chroma: number, hue: number): string {
  const channels = (c: number) => {
    const a = c * Math.cos(hue);
    const b = c * Math.sin(hue);
    const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
    return [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ];
  };
  const inGamut = (rgb: number[]) => rgb.every((c) => c >= 0 && c <= 1);
  let rgb = channels(chroma);
  if (!inGamut(rgb)) {
    // Reduce chroma, not individual channels, to preserve the intended hue.
    let low = 0;
    let high = chroma;
    for (let i = 0; i < 16; i++) {
      const mid = (low + high) / 2;
      if (inGamut(channels(mid))) low = mid;
      else high = mid;
    }
    rgb = channels(low);
  }
  return `#${rgb
    .map((c) => {
      const encoded =
        c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
      return Math.round(Math.max(0, Math.min(1, encoded)) * 255)
        .toString(16)
        .padStart(2, "0");
    })
    .join("")}`;
}

/** Input must be a validated six-digit hex (topAccentStyle owns fallback). */
export function createTopPalette(accent: string) {
  const { lightness, chroma, hue } = toOklch(accent);
  // Achromatic colours stay neutral; saturated colours cannot flood surfaces.
  const shade = (l: number, c: number) =>
    fromOklch(l, Math.min(chroma, c), hue);
  // Don't lighten a dark brand colour into a midtone that needs black text.
  // Keep the initial shade restrained, then verify its actual luminance.
  const primaryMaxLightness = pickForeground(accent) === "#ffffff" ? 0.54 : 0.6;
  let primaryLightness = Math.max(
    0.5,
    Math.min(primaryMaxLightness, lightness),
  );
  let primary = shade(primaryLightness, 0.17);
  // Yellow/green have higher luminance at the same perceptual lightness.
  // Check the gamut-mapped colour, including the shared button's 90% opacity
  // hover on white, so white labels remain readable in both states.
  const supportsWhiteLabels = (hex: string) => {
    const hover = `#${[1, 3, 5]
      .map((start) =>
        Math.round(parseInt(hex.slice(start, start + 2), 16) * 0.9 + 255 * 0.1)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")}`;
    return (
      pickForeground(hex) === "#ffffff" && pickForeground(hover) === "#ffffff"
    );
  };
  while (!supportsWhiteLabels(primary) && primaryLightness > 0.3) {
    primaryLightness -= 0.005;
    primary = shade(primaryLightness, 0.17);
  }
  return {
    primary,
    text: shade(0.43, 0.12),
    surface: shade(0.987, 0.003),
    ribbon: shade(0.945, 0.022),
    ribbonSoft: shade(0.97, 0.01),
    border: shade(0.89, 0.012),
    ctaStart: shade(0.965, 0.012),
    ctaMiddle: shade(0.99, 0.003),
    ctaEnd: shade(0.95, 0.016),
    muted: shade(0.47, 0.012),
  };
}
