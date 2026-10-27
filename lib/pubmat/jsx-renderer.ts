import type { ReactNode } from "react";
import type { Font } from "satori";
import { PubmatFitError } from "./core";
import { assetCache } from "./asset-cache";

export type PosterNode = {
  props: Record<string, unknown>;
  height: number;
  width: number;
  top: number;
};

let fonts: Promise<Font[]> | undefined;
let wasm: Promise<void> | undefined;

async function loadFonts() {
  fonts ??= Promise.all(
    ([400, 600, 700] as const).map(async (weight) => {
      const response = await fetch(
        new URL(`/fonts/pubmat/inter-${weight}.woff`, self.location.origin),
      );
      if (!response.ok) throw new Error("Could not load poster fonts.");
      return {
        name: "Inter",
        data: await response.arrayBuffer(),
        weight,
        style: "normal" as const,
      };
    }),
  ).catch((error) => {
    fonts = undefined;
    throw error;
  });
  return fonts;
}

/** Embed images so Satori/resvg do not depend on external URLs or canvas CORS. */
const cachedImage = assetCache<string>(12);
export function posterImage(src: string): Promise<string> {
  if (src.startsWith("data:")) return Promise.resolve(src);
  return cachedImage(src, () => readImage(src));
}

async function readImage(src: string): Promise<string> {
  if (src.startsWith("data:")) return src;
  const response = await fetch(src, { credentials: "include" });
  if (!response.ok) throw new Error("Could not load a poster image.");
  const bytes = await response.arrayBuffer();
  const signature = new Uint8Array(bytes);
  const mime =
    signature[0] === 0x89 && signature[1] === 0x50
      ? "image/png"
      : signature[0] === 0xff && signature[1] === 0xd8
        ? "image/jpeg"
        : signature[0] === 0x52 && signature[8] === 0x57
          ? "image/webp"
          : (response.headers.get("content-type") ??
            "application/octet-stream");
  const blob = new Blob([bytes], { type: mime });
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not decode a poster image."));
    };
    reader.onerror = () =>
      reject(new Error("Could not decode a poster image."));
    reader.readAsDataURL(blob);
  });
}

/** Shared export pipeline. Themes own their JSX; the exporter owns fonts/WASM. */
async function layoutPoster(
  element: ReactNode,
  onNode?: (node: PosterNode) => void,
  debug = false,
  measure = false,
): Promise<string> {
  const [{ default: satori }, loadedFonts] = await Promise.all([
    import("satori"),
    loadFonts(),
  ]);
  return satori(element, {
    width: 1080,
    height: 1080,
    fonts: loadedFonts,
    onNodeDetected: onNode,
    debug,
    embedFont: !measure,
  });
}

export async function rasterizePoster(svg: string): Promise<Blob> {
  const { Resvg, initWasm } = await import("@resvg/resvg-wasm");
  wasm ??= initWasm(
    fetch(
      new URL(
        new URL("@resvg/resvg-wasm/index_bg.wasm", import.meta.url).toString(),
        self.location.origin,
      ),
    ),
  ).catch((error) => {
    wasm = undefined;
    throw error;
  });
  await wasm;
  const renderer = new Resvg(svg);
  try {
    const rendered = renderer.render();
    try {
      return new Blob([new Uint8Array(rendered.asPng()).buffer], {
        type: "image/png",
      });
    } finally {
      rendered.free();
    }
  } finally {
    renderer.free();
  }
}

/** Shared fitting loop; themes supply only their JSX and layout safety rules. */
export async function renderFittedPoster(
  template: (adjustment: number, measure: boolean) => ReactNode,
  fits: (nodes: PosterNode[]) => boolean,
  debug = false,
  signal?: AbortSignal,
) {
  // Most posters fit at the first pass. Keep fallback attempts sparse so a
  // long title cannot monopolize the main thread with 21 Satori/resvg renders.
  const adjustments = [0, 6, 12, 20, 30, 40];
  for (const adjustment of adjustments) {
    signal?.throwIfAborted();
    if (adjustment)
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    const nodes: PosterNode[] = [];
    await layoutPoster(
      template(adjustment, true),
      (node) => nodes.push(node),
      debug,
      true,
    );
    signal?.throwIfAborted();
    if (fits(nodes)) {
      // Yield so cancellation messages can be handled before the final pass.
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      signal?.throwIfAborted();
      const finalSvg = await layoutPoster(
        template(adjustment, false),
        undefined,
        debug,
      );
      signal?.throwIfAborted();
      return { svg: finalSvg };
    }
  }
  throw new PubmatFitError(
    "title",
    "This copy is too long for the poster. Shorten the title or description.",
  );
}
