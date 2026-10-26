import { parse } from "@shuding/opentype.js";
import jsQR from "jsqr";
import {
  buildThemeLayout,
  PubmatFitError,
  type PosterFonts,
  type ThemeInput,
} from "./theme-layout";
import { PUBMAT_QR, PUBMAT_THEMES, type PubmatTheme } from "./themes";
import { applyReadingWash, minimumInkContrast } from "./theme-pixels";
import { footerReadingField, posterSvg, themeQr } from "./theme-svg";

type Rasterize = (svg: string) => Uint8Array;
type ImageAsset = {
  src: string;
  pixels: Uint8ClampedArray;
  width: number;
  height: number;
};
let fontsReady: Promise<PosterFonts> | undefined;
let markReady: Promise<ImageAsset> | undefined;
const backgrounds = new Map<PubmatTheme, Promise<ImageAsset>>();
const logos = new Map<string, Promise<ImageAsset>>();
// Serialize expensive image work instead of allocating three 1080px renderers
// at once when the carousel warms neighboring slides.
let queue: Promise<unknown> = Promise.resolve();
const pause = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function dataUri(bytes: Uint8Array) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000)
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return `data:image/png;base64,${btoa(binary)}`;
}
function canvas(width: number, height: number) {
  const element = document.createElement("canvas");
  element.width = width;
  element.height = height;
  const context = element.getContext("2d", { willReadFrequently: true });
  if (!context)
    throw new Error("Your browser could not open the poster canvas.");
  return { element, context };
}

async function decode(
  bytes: Uint8Array,
  maxSize?: number,
): Promise<ImageAsset> {
  const blob = new Blob([new Uint8Array(bytes).buffer]);
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (
      !image.naturalWidth ||
      image.naturalWidth * image.naturalHeight > 25_000_000
    )
      throw new Error("The image is too large to render safely.");
    const scale = maxSize
      ? Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight))
      : 1;
    const width = Math.max(1, Math.round(image.naturalWidth * scale)),
      height = Math.max(1, Math.round(image.naturalHeight * scale));
    const { element, context } = canvas(width, height);
    context.drawImage(image, 0, 0, width, height);
    return {
      src: maxSize ? element.toDataURL("image/png") : dataUri(bytes),
      pixels: context.getImageData(0, 0, width, height).data,
      width,
      height,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}
/** The bytes behind a `data:` URL. */
function dataBytes(uri: string) {
  const comma = uri.indexOf(",");
  if (comma < 0) throw new Error("The logo could not be read.");
  const meta = uri.slice(0, comma),
    payload = uri.slice(comma + 1);
  if (!/;base64/i.test(meta))
    return new TextEncoder().encode(decodeURIComponent(payload));
  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
async function fetchImage(url: string, maxSize?: number) {
  // A freshly picked logo arrives as a data: URL, and the policy keeps data:
  // out of connect-src — so it is read in place rather than fetched.
  if (url.startsWith("data:")) return decode(dataBytes(url), maxSize);
  const response = await fetch(url, { credentials: "include" });
  if (!response.ok)
    throw new Error("A poster image could not be loaded. Please try again.");
  return decode(new Uint8Array(await response.arrayBuffer()), maxSize);
}
function loadFonts() {
  fontsReady ??= Promise.all(
    ([400, 600, 700] as const).map(async (weight) => {
      const response = await fetch(`/fonts/pubmat/inter-${weight}.woff`);
      if (!response.ok)
        throw new Error(`The poster font ${weight} could not be loaded.`);
      return [weight, parse(await response.arrayBuffer())] as const;
    }),
  )
    .then((entries) => Object.fromEntries(entries) as PosterFonts)
    .catch((error) => {
      fontsReady = undefined;
      throw error;
    });
  return fontsReady;
}
function loadMark() {
  markReady ??= fetchImage("/pubmat/brand-mark.png").catch((error) => {
    markReady = undefined;
    throw error;
  });
  return markReady;
}
function loadBackground(theme: PubmatTheme) {
  let loading = backgrounds.get(theme);
  if (!loading) {
    loading = fetchImage(`/pubmat/backgrounds/${theme}.png`)
      .then((asset) => {
        if (asset.width !== 1080 || asset.height !== 1080)
          throw new Error("The poster background must be 1080 × 1080.");
        return asset;
      })
      .catch((error) => {
        backgrounds.delete(theme);
        throw error;
      });
    backgrounds.set(theme, loading);
  }
  return loading;
}
/** The same logo is re-used by every slide and every keystroke-driven redraw. */
function loadLogo(url: string) {
  let loading = logos.get(url);
  if (!loading) {
    loading = fetchImage(url, 512).catch(() => {
      logos.delete(url);
      throw new PubmatFitError(
        "companyLogo",
        "Your company logo could not be loaded. Please upload it again in Company settings.",
      );
    });
    // A freshly picked logo is a data URL, so don't keep many of them around.
    if (logos.size >= 4) {
      const oldest = logos.keys().next().value;
      if (oldest !== undefined) logos.delete(oldest);
    }
    logos.set(url, loading);
  }
  return loading;
}

/** The QR plate plus a little breathing room, lifted out of the finished 1080px
 * image so the code can be checked against fewer pixels. */
function qrCrop(pixels: Uint8ClampedArray) {
  const margin = 24,
    size = PUBMAT_QR.size + margin * 2;
  const x = Math.max(0, PUBMAT_QR.x - margin),
    y = Math.max(0, PUBMAT_QR.y - margin);
  const crop = new Uint8ClampedArray(size * size * 4);
  for (let row = 0; row < size; row++) {
    const from = ((y + row) * 1080 + x) * 4;
    crop.set(pixels.subarray(from, from + size * 4), row * size * 4);
  }
  return { pixels: crop, size };
}

type Prepared = {
  layout: ReturnType<typeof buildThemeLayout>;
  background: Uint8ClampedArray;
};

/** What the compositor needs: the measured layout, and the background pixels
 * washed or not. */
async function prepare(
  data: ThemeInput,
  theme: PubmatTheme,
  scale = 1,
): Promise<Prepared> {
  const [fonts, mark, source, logo] = await Promise.all([
    loadFonts(),
    loadMark(),
    loadBackground(theme),
    data.companyLogo ? loadLogo(data.companyLogo) : undefined,
  ]);
  const layout = buildThemeLayout(data, fonts, theme, mark, logo?.src, scale);
  const opacity = PUBMAT_THEMES[theme].washOpacity;
  const background = opacity
    ? await applyReadingWash(
        source.pixels,
        layout.boxes,
        opacity,
        layout.colors.dark,
        pause,
      )
    : source.pixels;
  return { layout, background };
}

/**
 * How much smaller the type gets when the copy sits on a busy part of the
 * artwork. The first attempt is the design's own sizes; the rest only run when
 * the check fails, so nothing pays for them normally.
 */
const TYPE_SCALES = [1, 0.9, 0.8];

/** Draw the poster, shrinking the copy until it is readable over the artwork.
 * Only a contrast failure is retried: a broken link or missing logo is not
 * something a smaller font fixes. */
async function readable<T>(
  data: ThemeInput,
  theme: PubmatTheme,
  draw: (prepared: Prepared) => Promise<T>,
): Promise<T> {
  let failed: unknown;
  for (const scale of TYPE_SCALES) {
    const prepared = await prepare(data, theme, scale);
    try {
      return await draw(prepared);
    } catch (error) {
      if (!(error instanceof PubmatFitError) || error.field !== "contrast")
        throw error;
      failed = error;
    }
  }
  throw failed;
}

async function verifyContrast(
  layout: Prepared["layout"],
  background: Uint8ClampedArray,
  rasterize: Rasterize,
) {
  for (const [paths, color, minimum] of [
    [layout.supporting, layout.colors.supporting, 4.5],
    [layout.title, layout.colors.title, 3],
  ] as const) {
    const mask = await decode(rasterize(posterSvg(paths.join(""))));
    if (minimumInkContrast(background, mask.pixels, color) < minimum)
      throw new PubmatFitError(
        "contrast",
        "This copy sits on a busy part of the artwork, even at the smallest type. Try another theme.",
      );
    await pause();
  }
}

/** Check the QR where it actually is. Scanning the whole 1080px poster costs
 * ~100ms on the main thread for the same answer: the modules never leave
 * PUBMAT_QR's plate, and the plate carries its own quiet zone. */
function verifyLink(pixels: Uint8ClampedArray, link: string) {
  const crop = qrCrop(pixels);
  const fullQr = jsQR(crop.pixels, crop.size, crop.size, {
    inversionAttempts: "attemptBoth",
  });
  if (fullQr?.data !== link)
    throw new PubmatFitError(
      "link",
      "The exported QR could not be verified. Please try a shorter listing link.",
    );
  const { context } = canvas(360, 360);
  const pixelCanvas = canvas(1080, 1080);
  pixelCanvas.context.putImageData(
    new ImageData(new Uint8ClampedArray(pixels), 1080, 1080),
    0,
    0,
  );
  context.imageSmoothingQuality = "high";
  context.drawImage(pixelCanvas.element, 0, 0, 360, 360);
  const feedQr = jsQR(context.getImageData(0, 0, 360, 360).data, 360, 360, {
    inversionAttempts: "attemptBoth",
  });
  if (feedQr?.data !== link)
    throw new PubmatFitError(
      "link",
      "The QR is too dense at feed size. Use a shorter canonical listing link.",
    );
}

/** Draw a transparent resvg raster straight onto the canvas. */
async function drawLayer(context: CanvasRenderingContext2D, bytes: Uint8Array) {
  const blob = new Blob([new Uint8Array(bytes).buffer]);
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    context.drawImage(image, 0, 0);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function toPng(element: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) =>
    element.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("The poster could not be encoded.")),
      "image/png",
    ),
  );
}

/** The artwork is laid down on a canvas and resvg only draws the layers on top:
 * one raster of the photo, and no PNG round-trip to get the wash through it. */
async function drawCanvas(
  data: ThemeInput,
  theme: PubmatTheme,
  rasterize: Rasterize,
): Promise<Blob> {
  return readable(data, theme, async ({ layout, background }) => {
    const { element, context } = canvas(1080, 1080);
    context.putImageData(
      new ImageData(new Uint8ClampedArray(background), 1080, 1080),
      0,
      0,
    );
    await drawLayer(context, rasterize(posterSvg(footerReadingField(theme))));
    await verifyContrast(
      layout,
      context.getImageData(0, 0, 1080, 1080).data,
      rasterize,
    );
    await drawLayer(
      context,
      rasterize(posterSvg(layout.elements.join("") + themeQr(data.link))),
    );
    verifyLink(context.getImageData(0, 0, 1080, 1080).data, data.link);
    return toPng(element);
  });
}

export function renderThemedPubmat(
  data: ThemeInput,
  theme: PubmatTheme,
  rasterize: Rasterize,
) {
  const result = queue.then(() => drawCanvas(data, theme, rasterize));
  queue = result.catch(() => undefined);
  return result;
}
