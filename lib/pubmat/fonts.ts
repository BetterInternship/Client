/**
 * Inter, static cuts only: satori can't pick a weight out of the variable font
 * next/font serves the site with. Fetched from our own origin (public/fonts/
 * pubmat) the first time a pubmat is drawn, then kept for the session.
 *
 * Each file is Fontsource's latin and latin-ext subsets merged into one
 * (fontTools.merge). Shipped as two files per weight, satori never fell back to
 * latin-ext, so "₱" and "ñ" came out as missing-glyph boxes — and the merged
 * file is the only one that has both.
 */
const WEIGHTS = [400, 700, 800] as const;

export type PubmatFont = {
  name: string;
  data: ArrayBuffer;
  weight: (typeof WEIGHTS)[number];
  style: "normal";
};

let cache: Promise<PubmatFont[]> | undefined;

export function loadPubmatFonts(): Promise<PubmatFont[]> {
  cache ??= Promise.all(
    WEIGHTS.map(async (weight) => {
      const res = await fetch(`/fonts/pubmat/inter-${weight}.woff`);
      if (!res.ok) throw new Error(`Couldn't load Inter ${weight}`);
      return {
        name: "Inter",
        weight,
        style: "normal" as const,
        data: await res.arrayBuffer(),
      };
    }),
  ).catch((error) => {
    cache = undefined; // let the next attempt retry rather than cache the failure
    throw error;
  });
  return cache;
}
