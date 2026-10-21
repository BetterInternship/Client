"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, ImageOff, Pencil, RotateCw } from "lucide-react";
import { Button, cn } from "@betterinternship/components";
import { useTilt } from "@/hooks/use-tilt";
import { useDbRefs } from "@/lib/db/use-refs";
import type { Job } from "@/lib/db/db.types";
import {
  DEFAULT_PUBMAT_FORMAT,
  PUBMAT_FORMAT_IDS,
  PUBMAT_FORMATS,
  type PubmatFormat,
} from "@/lib/pubmat/formats";
import { pubmatDataFromJob } from "@/lib/pubmat/from-job";
import { clampPubmatData } from "@/lib/pubmat/params";
import { renderPubmat } from "@/lib/pubmat/render";

/**
 * A listing's pubmat: see it, download it, and pick a layout for where it's
 * going. Two shapes, depending on `onEdit`:
 *
 *  - with it, the compact one used inline on an empty listing — the preview,
 *    Download, and an "Edit pubmat" button that calls `onEdit` (which opens
 *    the modal). The layout stays the default square.
 *  - without it, the full one inside that modal, with the layout options
 *    always showing.
 *
 * The image is drawn in the browser (lib/pubmat/render.ts) into a PNG blob:
 * the preview is an <img> on its object URL and Download saves that same blob,
 * so what's saved is what's shown, and nothing is sent to a server.
 */

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

export function PubmatCreator({
  job,
  link,
  maxPreviewHeight = 320,
  onEdit,
}: {
  job: Job;
  /** The listing's short share link; the QR code opens it. */
  link: string;
  /** Tallest the preview gets, so a 9:16 story doesn't run off the screen. */
  maxPreviewHeight?: number;
  onEdit?: () => void;
}) {
  const refs = useDbRefs();
  const tilt = useTilt();
  const [format, setFormat] = useState<PubmatFormat>(DEFAULT_PUBMAT_FORMAT);
  const [image, setImage] = useState<{ url: string; key: string }>();
  const [failedKey, setFailedKey] = useState<string>();
  const [attempt, setAttempt] = useState(0);

  const data = useMemo(
    () => clampPubmatData(pubmatDataFromJob(job, refs, link)),
    [job, refs, link],
  );
  const { label, width, height } = PUBMAT_FORMATS[format];

  // Re-draws whenever the listing, the layout or a retry changes `key`. The
  // previous image stays up until the new one is ready, and a draw that's been
  // superseded is dropped instead of landing late.
  const key = `${format}-${attempt}-${JSON.stringify(data)}`;
  useEffect(() => {
    let cancelled = false;
    let url: string | undefined;
    renderPubmat(data, format)
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setImage({ url, key });
        setFailedKey(undefined);
      })
      .catch((error) => {
        console.error("[pubmat] render failed", error);
        if (!cancelled) setFailedKey(key);
      });
    return () => {
      cancelled = true;
    };
  }, [key, data, format]);

  // Object URLs outlive the component unless released.
  useEffect(() => {
    const url = image?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [image?.url]);

  const status =
    failedKey === key ? "error" : image?.key === key ? "ready" : "loading";

  const download = () => {
    if (!image) return;
    const a = document.createElement("a");
    a.href = image.url;
    a.download = `${slug(`${data.title}-${data.company}`) || "listing"}-${format}-pubmat.png`;
    a.click();
  };

  const selectFormat = (next: PubmatFormat) => {
    if (next === format) return;
    setFormat(next);
  };

  const retry = () => setAttempt((n) => n + 1);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {/* The outer box takes the layout's shape, so switching layouts doesn't
          jump the page about once the new image arrives. It stays still and
          watches the mouse; the inner one is what tilts. */}
      <div
        {...tilt.containerProps}
        className="[perspective:900px]"
        style={{
          aspectRatio: `${width} / ${height}`,
          width: `min(100%, ${Math.round((maxPreviewHeight * width) / height)}px)`,
        }}
      >
        <div
          ref={tilt.ref}
          className="relative size-full overflow-hidden rounded-[0.33em] border border-gray-200 bg-gray-50 shadow-md transition-[transform,box-shadow] duration-150 ease-out will-change-transform hover:shadow-xl motion-reduce:transition-none"
        >
          {status === "loading" && (
            <div
              className={cn(
                "absolute inset-0 z-10 animate-pulse",
                image ? "bg-gray-100/60" : "bg-gray-100",
              )}
            />
          )}
          {status === "error" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
              <ImageOff className="size-7 text-gray-400" />
              <p className="text-sm text-gray-600">
                Couldn&apos;t make the pubmat.
              </p>
              <Button variant="outline" onClick={retry}>
                <RotateCw />
                Try again
              </Button>
            </div>
          ) : (
            image && (
              <img
                src={image.url}
                alt={`${label} pubmat for ${job.title ?? "your listing"}`}
                className="size-full object-contain"
              />
            )
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button disabled={status !== "ready"} onClick={download}>
          <Download />
          Download
        </Button>
        {onEdit && (
          <Button variant="outline" onClick={onEdit}>
            <Pencil />
            Edit
          </Button>
        )}
      </div>

      {!onEdit && (
        <div
          role="radiogroup"
          aria-label="Pubmat layout"
          className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4"
        >
          {PUBMAT_FORMAT_IDS.map((id) => {
            const option = PUBMAT_FORMATS[id];
            const selected = id === format;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => selectFormat(id)}
                className={cn(
                  "flex cursor-pointer flex-col items-start gap-0.5 rounded-[0.33em] border px-3 py-2 text-left transition-colors",
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300",
                )}
              >
                <span className="text-sm font-semibold">{option.label}</span>
                <span className="text-xs text-gray-500">{option.sites}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
