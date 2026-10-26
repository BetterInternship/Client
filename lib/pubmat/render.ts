import { createElement } from "react";
import { DEFAULT_PUBMAT_DESIGN, type PubmatDesign } from "./designs";
import { PUBMAT_FORMATS, type PubmatFormat } from "./formats";
import { loadPubmatFonts } from "./fonts";
import type { PubmatData } from "./params";
import { PubmatTemplate } from "./template";
import { isPubmatTheme } from "./themes";

/**
 * Draws a pubmat in the browser: satori lays the template out as an SVG, resvg
 * (wasm) rasterises that to a PNG. Both are imported on first use, so none of
 * it loads until someone opens a pubmat.
 */

let resvgReady: Promise<void> | undefined;

function initResvg(): Promise<void> {
  resvgReady ??= import("@resvg/resvg-wasm")
    .then(({ initWasm }) =>
      initWasm(
        fetch(new URL("@resvg/resvg-wasm/index_bg.wasm", import.meta.url)),
      ),
    )
    .catch((error) => {
      resvgReady = undefined;
      throw error;
    });
  return resvgReady;
}

/** resvg rasterises an SVG into PNG bytes at its own size (1080px posters). */
async function themedRasterizer() {
  const { Resvg } = await import("@resvg/resvg-wasm");
  await initResvg();
  return (svg: string) => {
    const renderer = new Resvg(svg);
    try {
      const image = renderer.render();
      try { return image.asPng(); } finally { image.free(); }
    } finally { renderer.free(); }
  };
}

export async function renderPubmat(
  data: PubmatData,
  format: PubmatFormat,
  design: PubmatDesign = DEFAULT_PUBMAT_DESIGN,
): Promise<Blob> {
  if (isPubmatTheme(design)) {
    const [{ renderThemedPubmat }, rasterize] = await Promise.all([
      import("./render-theme"), themedRasterizer(),
    ]);
    return renderThemedPubmat(data, design, rasterize);
  }
  const { width, height } = PUBMAT_FORMATS[format];
  const [{ default: satori }, { Resvg }, fonts] = await Promise.all(
    [
      import("satori"),
      import("@resvg/resvg-wasm"),
      loadPubmatFonts(design),
      initResvg(),
    ],
  );

  const svg = await satori(
    createElement(PubmatTemplate, { data, format, design }),
    { width, height, fonts },
  );
  const renderer = new Resvg(svg, { fitTo: { mode: "width", value: width } });
  try {
    const image = renderer.render();
    try { return new Blob([new Uint8Array(image.asPng()).buffer], { type: "image/png" }); }
    finally { image.free(); }
  } finally { renderer.free(); }
}
