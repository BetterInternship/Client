"use client";

import { useEffect, useMemo, useState } from "react";
import { useDbRefs } from "@/lib/db/use-refs";
import type { Job } from "@/lib/db/db.types";
import { DEFAULT_PUBMAT_DESIGN, type PubmatDesign } from "@/lib/pubmat/designs";
import { pubmatDataFromJob } from "@/lib/pubmat/from-job";
import { renderPubmat } from "@/lib/pubmat/render";
import * as imageCache from "@/lib/pubmat/image-cache";
import { usePfpUrl } from "@/hooks/use-pfp";
import type { PosterCopy } from "@/lib/pubmat/core";

/**
 * A listing's pubmat, drawn in the browser (lib/pubmat/render.ts) into a PNG
 * blob, in the given `design` (lib/pubmat/designs.ts). Always the square
 * layout, which suits every feed it's likely to be posted to. `url` is an
 * object URL on that blob, for an <img> or a download, so what's shown and
 * what's saved or shared are the same bytes.
 *
 * Nothing is drawn until there's a `link` — the QR code opens it.
 */

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

export const pubmatFileName = (job: Job) =>
  `${slug(`${job.title ?? ""}-${(job.employer ?? job.employers)?.name ?? ""}`) || "listing"}-pubmat.png`;

export function usePubmatImage(
  job: Job,
  link: string | undefined,
  design: PubmatDesign = DEFAULT_PUBMAT_DESIGN,
  copy?: PosterCopy,
  logoOverride?: string | null,
  backgroundImage?: string,
  backgroundPosition?: { x: number; y: number; scale: number },
  /** Keep the last drawing even when `link` goes away (a slide near the one on
   * show, temporarily not wanted because the text editor is open). */
  hold = false,
) {
  const refs = useDbRefs();
  // A pubmat only ever shows the viewer's own listing, so its logo is the
  // current employer's — asked for as "me", the same way the hire header does
  // (app-header.tsx). The job's employer id does not resolve here.
  const companyLogo = usePfpUrl({
    id: "me",
    source: "employer",
    enabled: logoOverride === undefined && !!link,
  });
  const [image, setImage] = useState<{
    url: string;
    blob: Blob;
    key: string;
  }>();
  const [failure, setFailure] = useState<{ key: string; message: string }>();
  const [attempt, setAttempt] = useState(0);

  const data = useMemo(
    () =>
      link && !companyLogo.loading
        ? (() => {
            const listingData = pubmatDataFromJob(job, refs, link, true);
            const raw = {
              ...listingData,
              ...copy,
              workMode: copy?.setup ?? listingData.workMode,
              companyLogo:
                (logoOverride === undefined ? companyLogo.url : logoOverride) ||
                undefined,
              backgroundImage,
              backgroundPosition,
            };
            return raw;
          })()
        : undefined,
    [
      job,
      refs,
      link,
      copy,
      companyLogo.url,
      companyLogo.loading,
      logoOverride,
      backgroundImage,
      backgroundPosition,
    ],
  );

  // Re-draws whenever the listing, the design or a retry changes `key`. The
  // previous image stays up until the new one is ready, and a draw that's been
  // superseded is dropped instead of landing late.
  //
  // A poster that has already been drawn is picked up from the cache instead —
  // that's what makes swiping back, or reopening the modal, instant. Edited
  // copy is drawn but not kept: typing its way through a variant per keystroke
  // would push every pristine poster out of the cache.
  const key = `${design}-${attempt}-${JSON.stringify(data)}`;
  const pristine = !copy || Object.keys(copy).length === 0;
  useEffect(() => {
    if (!data) return;
    const drawn = imageCache.read(key);
    if (drawn) {
      setImage({ url: URL.createObjectURL(drawn), blob: drawn, key });
      setFailure(undefined);
      return;
    }
    let cancelled = false;
    imageCache
      .once(key, () => renderPubmat(data, design))
      .then((blob) => {
        if (cancelled) return;
        setImage({ url: URL.createObjectURL(blob), blob, key });
        setFailure(undefined);
        if (pristine) imageCache.write(key, blob);
      })
      .catch((error) => {
        console.error("[pubmat] render failed", error);
        if (!cancelled)
          setFailure({
            key,
            message:
              error instanceof Error
                ? error.message
                : "Could not make the pubmat. Please try again.",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [key, data, design, pristine]);

  // Object URLs outlive the component unless released.
  useEffect(() => {
    const url = image?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [image?.url]);

  // A slide that has moved out of reach hands its picture back. The carousel
  // keeps every slide mounted, so without this one tour of the designs would
  // hold fourteen decoded 1080px bitmaps at once. The bytes stay cached
  // (lib/pubmat/image-cache.ts), so coming back to it is a decode, not a draw.
  useEffect(() => {
    if (link || hold) return;
    setImage(undefined);
    setFailure(undefined);
  }, [link, hold]);

  const status: "loading" | "ready" | "error" =
    failure?.key === key
      ? "error"
      : data && image?.key === key
        ? "ready"
        : "loading";

  return {
    image,
    status,
    error: failure?.key === key ? failure.message : undefined,
    retry: () => setAttempt((n) => n + 1),
  };
}
