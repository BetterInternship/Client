import { DEFAULT_PUBMAT_DESIGN, type PubmatDesign } from "./designs";
import type { PubmatFormat } from "./formats";
import type { PubmatData } from "./params";
import { PUBMAT_V2_DESIGN } from "./v2";

/** Render the active square pubmat. Format remains part of the public API for callers. */
export async function renderPubmat(
  data: PubmatData,
  _format: PubmatFormat,
  design: PubmatDesign = DEFAULT_PUBMAT_DESIGN,
): Promise<Blob> {
  if (design !== PUBMAT_V2_DESIGN)
    throw new Error("That poster design is no longer available.");
  const { renderPubmatV2 } = await import("./v2/render");
  return renderPubmatV2(data);
}
