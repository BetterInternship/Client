import { create } from "qrcode";
import { PubmatFitError } from "./core";

/** Shared poster QR: crisp integer modules, transparent background, no padding. */
export function posterQr(link: string, targetSize = 224) {
  if (!link.trim())
    throw new PubmatFitError("link", "A listing link is required.");
  const code = create(link, { errorCorrectionLevel: "L" });
  const count = code.modules.size;
  const step = Math.ceil(targetSize / count);
  if (step < 3)
    throw new PubmatFitError(
      "link",
      "This link is too long for the poster QR.",
    );
  const size = step * count;
  let path = "";
  for (let y = 0; y < count; y++)
    for (let x = 0; x < count; x++) {
      if (code.modules.data[y * count + x])
        path += `M${x * step} ${y * step}h${step}v${step}h-${step}z`;
    }
  return {
    size,
    src: `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><path d="${path}" fill="black"/></svg>`)}`,
  };
}
