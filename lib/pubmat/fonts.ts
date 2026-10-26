import type { PubmatDesign } from "./designs";

/**
 * Static font cuts only: satori can't pick a weight out of the variable font
 * next/font serves the site with. Fetched from our own origin (public/fonts/
 * pubmat) the first time a design is drawn, then kept for the session.
 *
 * Inter's files are Fontsource's latin and latin-ext subsets merged into one
 * (fontTools.merge). Shipped as two files per weight, satori never fell back to
 * latin-ext, so "₱" and "ñ" came out as missing-glyph boxes — and the merged
 * file is the only one that has both. Unbounded's are the same merge, trimmed
 * down to the characters a listing uses (Latin, Latin-1, Latin Extended-A, the
 * usual punctuation and "₱"), since a wide display face is a lot heavier.
 */
const FAMILIES = {
  Inter: { file: "inter", weights: [400, 700, 800] },
  Unbounded: { file: "unbounded", weights: [500, 700, 900] },
} as const;

type Family = keyof typeof FAMILIES;

/** Each design's typefaces. A later one covers glyphs an earlier one lacks. */
const DESIGN_FAMILIES: Record<"classic" | "aura", Family[]> = {
  classic: ["Inter"],
  aura: ["Unbounded", "Inter"],
};

export type PubmatFont = {
  name: Family;
  data: ArrayBuffer;
  weight: (typeof FAMILIES)[Family]["weights"][number];
  style: "normal";
};

const cache = new Map<Family, Promise<PubmatFont[]>>();

function loadFamily(name: Family): Promise<PubmatFont[]> {
  let loading = cache.get(name);
  if (!loading) {
    const { file, weights } = FAMILIES[name];
    loading = Promise.all(
      weights.map(async (weight) => {
        const res = await fetch(`/fonts/pubmat/${file}-${weight}.woff`);
        if (!res.ok) throw new Error(`Couldn't load ${name} ${weight}`);
        return {
          name,
          weight,
          style: "normal" as const,
          data: await res.arrayBuffer(),
        };
      }),
    ).catch((error) => {
      cache.delete(name); // let the next attempt retry rather than cache the failure
      throw error;
    });
    cache.set(name, loading);
  }
  return loading;
}

export async function loadPubmatFonts(
  design: PubmatDesign,
): Promise<PubmatFont[]> {
  const families = await Promise.all(DESIGN_FAMILIES[design === "aura" ? "aura" : "classic"].map(loadFamily));
  return families.flat();
}
