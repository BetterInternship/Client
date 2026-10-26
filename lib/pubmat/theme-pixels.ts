import type { InkBox } from "./theme-layout";

/** Preserve source assets: blend only the in-memory export reading field. */
export async function applyReadingWash(
  source: Uint8ClampedArray,
  regions: InkBox[],
  opacity: number,
  dark: boolean,
  yieldControl: () => Promise<void> = () => Promise.resolve(),
) {
  const pixels = new Uint8ClampedArray(source);
  if (!opacity || !regions.length) return pixels;
  const wash = dark ? [8, 37, 29] : [255, 255, 255];
  // Coverage is 0 more than 100px from every box, and the blend leaves the
  // source untouched there, so only the union of the boxes plus that feather
  // needs visiting. The pixels written are identical either way.
  const feather = 100;
  let left = 1080,
    top = 1080,
    right = 0,
    bottom = 0;
  for (const region of regions) {
    left = Math.min(left, region.x - feather);
    top = Math.min(top, region.y - feather);
    right = Math.max(right, region.x + region.width + feather);
    bottom = Math.max(bottom, region.y + region.height + feather);
  }
  const x0 = Math.max(0, Math.floor(left)),
    y0 = Math.max(0, Math.floor(top));
  const x1 = Math.min(1080, Math.ceil(right)),
    y1 = Math.min(1080, Math.ceil(bottom));
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      let coverage = 0;
      for (const region of regions) {
        const dx = Math.max(region.x - x, 0, x - region.x - region.width);
        const dy = Math.max(region.y - y, 0, y - region.y - region.height);
        // Beyond the feather the contribution is exactly 0, so the expensive
        // hypot is only worth calling inside it.
        if (dx * dx + dy * dy >= 10000) continue;
        coverage = Math.max(coverage, 1 - Math.hypot(dx, dy) / 100);
      }
      // The approved native proof stores coverage in Float32Array. Keep the
      // same precision so 8-bit rounding is identical even at feather edges.
      const index = (y * 1080 + x) * 4,
        alpha = opacity * Math.fround(coverage);
      for (let c = 0; c < 3; c++)
        pixels[index + c] = Math.round(
          source[index + c] * (1 - alpha) + wash[c] * alpha,
        );
    }
    if (y % 128 === 127) await yieldControl();
  }
  return pixels;
}

// sRGB channel (0-255) to linear light. One table lookup per channel instead
// of a division, a power and two array allocations — same formula, same bits,
// but the per-pixel contrast scan stops being one of the slowest steps.
const linear = Float64Array.from({ length: 256 }, (_, value) => {
  const s = value / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
});

export function relativeLuminance(r: number, g: number, b: number) {
  return linear[r] * 0.2126 + linear[g] * 0.7152 + linear[b] * 0.0722;
}

/** Check local glyph interiors, not box averages or anti-aliased fringe pixels. */
export function minimumInkContrast(
  background: Uint8ClampedArray,
  mask: Uint8ClampedArray,
  color: string,
) {
  const rgb = color.match(/\w\w/g)!.map((value) => parseInt(value, 16));
  const ink = relativeLuminance(rgb[0], rgb[1], rgb[2]);
  let minimum = Infinity;
  for (let i = 0; i < mask.length; i += 4) {
    if (mask[i + 3] <= 220) continue;
    const bg = relativeLuminance(
      background[i],
      background[i + 1],
      background[i + 2],
    );
    minimum = Math.min(
      minimum,
      (Math.max(bg, ink) + 0.05) / (Math.min(bg, ink) + 0.05),
    );
  }
  return minimum;
}
