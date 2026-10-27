import type { PosterBackground } from "./theme-types";
import { posterImage } from "./jsx-renderer";
import { PubmatFitError } from "./core";
import { assetCache } from "./asset-cache";

export function posterBackground(
  value: string | undefined,
  presets: readonly [PosterBackground, ...PosterBackground[]],
) {
  return posterImage(
    value?.startsWith("data:")
      ? value
      : (presets.find((item) => item.id === value) ?? presets[0]).src,
  );
}

/** Logo preparation is shared; each layout chooses its size/trim policy. */
const cachedLogo = assetCache<{ src: string; width: number; height: number }>(
  6,
);
export function posterLogo(
  src: string | undefined,
  options: { width: number; height: number; trim?: boolean; upscale?: boolean },
) {
  if (!src) return Promise.resolve(undefined);
  return cachedLogo(JSON.stringify([src, options]), () =>
    prepareLogo(src, options),
  );
}

async function prepareLogo(
  src: string,
  options: { width: number; height: number; trim?: boolean; upscale?: boolean },
) {
  let embedded = await posterImage(src);
  const image = new Image();
  image.src = embedded;
  await image.decode();
  let width = image.naturalWidth,
    height = image.naturalHeight;
  if (!width || !height || width * height > 25_000_000)
    throw new PubmatFitError(
      "companyLogo",
      "The employer logo is too large or invalid.",
    );
  if (options.trim) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not process the logo.");
    ctx.drawImage(image, 0, 0);
    const pixels = ctx.getImageData(0, 0, width, height).data;
    let left = width,
      top = height,
      right = -1,
      bottom = -1;
    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        if (pixels[(y * width + x) * 4 + 3]) {
          left = Math.min(left, x);
          top = Math.min(top, y);
          right = Math.max(right, x);
          bottom = Math.max(bottom, y);
        }
      }
    if (right < left)
      throw new PubmatFitError(
        "companyLogo",
        "This logo is entirely transparent.",
      );
    width = right - left + 1;
    height = bottom - top + 1;
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, left, top, width, height, 0, 0, width, height);
    embedded = canvas.toDataURL("image/png");
  }
  const scale = Math.min(
    options.upscale ? Infinity : 1,
    options.width / width,
    options.height / height,
  );
  return { src: embedded, width: width * scale, height: height * scale };
}
