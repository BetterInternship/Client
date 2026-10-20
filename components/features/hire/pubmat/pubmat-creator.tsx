"use client";

import { useMemo, useState } from "react";
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
import { pubmatSearchParams } from "@/lib/pubmat/params";

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
 * The image is the /api/pubmat route itself: the preview is an <img> on its
 * URL, and Download is the same URL with `download=1`, which the route answers
 * with an attachment — so what's saved is what's shown, with nothing rendered
 * client-side.
 */
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
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [attempt, setAttempt] = useState(0);

  const query = useMemo(
    () => pubmatSearchParams(pubmatDataFromJob(job, refs, link)).toString(),
    [job, refs, link],
  );
  const { label, width, height } = PUBMAT_FORMATS[format];
  const imageUrl = `/api/pubmat?${query}&format=${format}`;

  const selectFormat = (next: PubmatFormat) => {
    if (next === format) return;
    setFormat(next);
    setStatus("loading");
  };

  const retry = () => {
    setStatus("loading");
    setAttempt((n) => n + 1);
  };

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
            <div className="absolute inset-0 animate-pulse bg-gray-100" />
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
            <img
              key={`${format}-${attempt}`}
              src={`${imageUrl}&attempt=${attempt}`}
              alt={`${label} pubmat for ${job.title ?? "your listing"}`}
              onLoad={() => setStatus("ready")}
              onError={() => setStatus("error")}
              className="size-full object-contain"
            />
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          disabled={status !== "ready"}
          onClick={() => window.location.assign(`${imageUrl}&download=1`)}
        >
          <Download />
          Download {label.toLowerCase()} ({width}×{height})
        </Button>
        {onEdit && (
          <Button variant="outline" onClick={onEdit}>
            <Pencil />
            Edit pubmat
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
