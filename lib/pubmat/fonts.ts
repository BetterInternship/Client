import fs from "node:fs";
import path from "node:path";

/**
 * Inter, static cuts only: satori can't pick a weight out of the variable font
 * next/font serves the site with, and fetching one from Google at render time
 * (as top-og-image.tsx does) would put a third party in the download path.
 *
 * Each file is Fontsource's latin and latin-ext subsets merged into one
 * (fontTools.merge). Shipped as two files per weight, satori never fell back to
 * latin-ext, so "₱" and "ñ" came out as missing-glyph boxes — and the merged
 * file is the only one that has both. next.config.mjs lists the files for
 * tracing so they ship with the route.
 */
const WEIGHTS = [400, 700, 800] as const;

type PubmatFont = {
  name: string;
  data: Buffer;
  weight: (typeof WEIGHTS)[number];
  style: "normal";
};

let cache: PubmatFont[] | undefined;

export function loadPubmatFonts(): PubmatFont[] {
  if (cache) return cache;
  cache = WEIGHTS.map((weight) => ({
    name: "Inter",
    weight,
    style: "normal" as const,
    data: fs.readFileSync(
      path.join(process.cwd(), "lib/pubmat/fonts", `inter-${weight}.woff`),
    ),
  }));
  return cache;
}
