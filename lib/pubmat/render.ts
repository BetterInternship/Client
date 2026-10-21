import { createElement } from "react";
import { PUBMAT_FORMATS, type PubmatFormat } from "./formats";
import { loadPubmatFonts } from "./fonts";
import type { PubmatData } from "./params";
import { PubmatTemplate } from "./template";

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

export async function renderPubmat(
  data: PubmatData,
  format: PubmatFormat,
): Promise<Blob> {
  const { width, height } = PUBMAT_FORMATS[format];
  const [{ default: satori }, { Resvg }, fonts] = await Promise.all([
    import("satori"),
    import("@resvg/resvg-wasm"),
    loadPubmatFonts(),
    initResvg(),
  ]);

  const svg = await satori(createElement(PubmatTemplate, { data, format }), {
    width,
    height,
    fonts,
  });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: width } })
    .render()
    .asPng();
  return new Blob([png as BlobPart], { type: "image/png" });
}
