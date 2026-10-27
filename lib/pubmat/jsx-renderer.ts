import type { ReactNode } from "react";
import type { Font } from "satori";
import { PubmatFitError } from "./core";

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
      const response = await fetch(`/fonts/pubmat/inter-${weight}.woff`);
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
export async function posterImage(src: string): Promise<string> {
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
export async function renderPosterJsx(
  element: ReactNode,
  onNode?: (node: PosterNode) => void,
  debug = false,
): Promise<{ svg: string; blob: Blob }> {
  const [{ default: satori }, { Resvg, initWasm }, loadedFonts] =
    await Promise.all([
      import("satori"),
      import("@resvg/resvg-wasm"),
      loadFonts(),
    ]);
  wasm ??= initWasm(
    fetch(new URL("@resvg/resvg-wasm/index_bg.wasm", import.meta.url)),
  ).catch((error) => {
    wasm = undefined;
    throw error;
  });
  await wasm;
  const svg = await satori(element, {
    width: 1080,
    height: 1080,
    fonts: loadedFonts,
    onNodeDetected: onNode,
    debug,
  });
  const renderer = new Resvg(svg);
  try {
    const rendered = renderer.render();
    try {
      return {
        svg,
        blob: new Blob([new Uint8Array(rendered.asPng()).buffer], {
          type: "image/png",
        }),
      };
    } finally {
      rendered.free();
    }
  } finally {
    renderer.free();
  }
}

/** Shared fitting loop; themes supply only their JSX and layout safety rules. */
export async function renderFittedPoster(
  template: (adjustment: number) => ReactNode,
  fits: (nodes: PosterNode[]) => boolean,
  debug = false,
) {
  for (let adjustment = 0; adjustment <= 40; adjustment += 2) {
    const nodes: PosterNode[] = [];
    const output = await renderPosterJsx(
      template(adjustment),
      (node) => nodes.push(node),
      debug,
    );
    if (fits(nodes)) return output;
  }
  throw new PubmatFitError(
    "title",
    "This copy is too long for the poster. Shorten the title or description.",
  );
}
