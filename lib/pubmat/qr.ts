import { create } from "qrcode";

/**
 * The QR as an SVG data URI — satori draws that crisply at any size, where a
 * rasterised one would soften. Modules are merged into horizontal runs so the
 * path stays small.
 */
export function qrCode(text: string, color = "#000000") {
  const qr = create(text, { errorCorrectionLevel: "M" });
  const n = qr.modules.size;
  const bits = qr.modules.data;
  let d = "";
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (!bits[y * n + x]) continue;
      let run = 1;
      while (x + run < n && bits[y * n + x + run]) run++;
      d += `M${x} ${y}h${run}v1h-${run}z`;
      x += run - 1;
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges"><path fill="${color}" d="${d}"/></svg>`;
  return {
    src: `data:image/svg+xml;base64,${btoa(svg)}`,
    modules: n,
  };
}
