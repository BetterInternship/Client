"use client";

import { useEffect, useMemo, useState } from "react";
import { useDbRefs } from "@/lib/db/use-refs";
import type { Job } from "@/lib/db/db.types";
import { DEFAULT_PUBMAT_DESIGN, type PubmatDesign } from "@/lib/pubmat/designs";
import type { PubmatFormat } from "@/lib/pubmat/formats";
import { pubmatDataFromJob } from "@/lib/pubmat/from-job";
import { clampPubmatData } from "@/lib/pubmat/params";
import { renderPubmat } from "@/lib/pubmat/render";

/**
 * A listing's pubmat, drawn in the browser (lib/pubmat/render.ts) into a PNG
 * blob, in the given `design` (lib/pubmat/designs.ts). Always the square
 * layout, which suits every feed it's likely to be posted to. `url` is an
 * object URL on that blob, for an <img> or a download, so what's shown and
 * what's saved or shared are the same bytes.
 *
 * Nothing is drawn until there's a `link` — the QR code opens it.
 */

const FORMAT: PubmatFormat = "square";

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
) {
  const refs = useDbRefs();
  const [image, setImage] = useState<{
    url: string;
    blob: Blob;
    key: string;
  }>();
  const [failedKey, setFailedKey] = useState<string>();
  const [attempt, setAttempt] = useState(0);

  const data = useMemo(
    () =>
      link ? clampPubmatData(pubmatDataFromJob(job, refs, link)) : undefined,
    [job, refs, link],
  );

  // Re-draws whenever the listing, the design or a retry changes `key`. The
  // previous image stays up until the new one is ready, and a draw that's been
  // superseded is dropped instead of landing late.
  const key = `${design}-${attempt}-${JSON.stringify(data)}`;
  useEffect(() => {
    if (!data) return;
    let cancelled = false;
    renderPubmat(data, FORMAT, design)
      .then((blob) => {
        if (cancelled) return;
        setImage({ url: URL.createObjectURL(blob), blob, key });
        setFailedKey(undefined);
      })
      .catch((error) => {
        console.error("[pubmat] render failed", error);
        if (!cancelled) setFailedKey(key);
      });
    return () => {
      cancelled = true;
    };
  }, [key, data, design]);

  // Object URLs outlive the component unless released.
  useEffect(() => {
    const url = image?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [image?.url]);

  const status: "loading" | "ready" | "error" =
    failedKey === key ? "error" : image?.key === key ? "ready" : "loading";

  return {
    image,
    status,
    retry: () => setAttempt((n) => n + 1),
  };
}
