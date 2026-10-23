"use client";

import { useCallback, useEffect, useState } from "react";
import { ImageOff, RotateCw } from "lucide-react";
import { Button, cn } from "@betterinternship/components";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useTilt } from "@/hooks/use-tilt";
import type { Job } from "@/lib/db/db.types";
import {
  DEFAULT_PUBMAT_DESIGN,
  PUBMAT_DESIGN_IDS,
  PUBMAT_DESIGNS,
  type PubmatDesign,
} from "@/lib/pubmat/designs";
import { PubmatActions } from "./pubmat-actions";
import { pubmatFileName, usePubmatImage } from "./use-pubmat-image";

/**
 * A listing's pubmat: swipe or page through its designs, then download it or
 * share it (pubmat-actions.tsx). Each slide is an <img> on its own drawn image's
 * object URL, and Download saves that same blob, so what's saved is what's
 * shown, and nothing is sent to a server (see use-pubmat-image.ts).
 *
 * Drawing is the expensive part, so a slide only draws once it's wanted: the
 * design on show first, then the ones either side of it once that's done, so
 * a swipe usually lands on a finished preview. A design that's been drawn is
 * kept as the carousel moves on.
 */

type SlideState = Pick<ReturnType<typeof usePubmatImage>, "image" | "status">;

function PubmatSlide({
  job,
  link,
  design,
  wanted,
  onChange,
}: {
  job: Job;
  link: string;
  design: PubmatDesign;
  /** Whether to draw this design yet. */
  wanted: boolean;
  onChange: (design: PubmatDesign, state: SlideState) => void;
}) {
  const tilt = useTilt();
  const { image, status, retry } = usePubmatImage(
    job,
    wanted ? link : undefined,
    design,
  );

  // The creator needs the visible slide's image for Download and Share.
  useEffect(() => {
    onChange(design, { image, status });
  }, [design, image, status, onChange]);

  return (
    // Padded so the shadow and the tilt aren't clipped by the carousel's edge.
    <div className="p-2">
      {/* The box holds the square, so nothing jumps about once the image
          arrives. It stays still and watches the mouse; the inner one is what
          tilts. */}
      <div
        {...tilt.containerProps}
        className="aspect-square [perspective:900px]"
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
                alt={`${PUBMAT_DESIGNS[design].label} pubmat for ${job.title ?? "your listing"}`}
                // Dragging the picture would fight the carousel's own drag.
                draggable={false}
                className="size-full select-none object-contain"
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

export function PubmatCreator({
  job,
  link,
  maxPreviewSize = 320,
}: {
  job: Job;
  /** The listing's short share link; the QR code opens it. */
  link: string;
  /** Biggest the preview gets, in px, so it doesn't swamp the page. */
  maxPreviewSize?: number;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [design, setDesign] = useState<PubmatDesign>(DEFAULT_PUBMAT_DESIGN);
  const [slides, setSlides] = useState<
    Partial<Record<PubmatDesign, SlideState>>
  >({});
  const [warm, setWarm] = useState<ReadonlySet<PubmatDesign>>(new Set());

  const count = PUBMAT_DESIGN_IDS.length;
  const current = slides[design];

  const handleSlide = useCallback(
    (id: PubmatDesign, state: SlideState) =>
      setSlides((all) => ({ ...all, [id]: state })),
    [],
  );

  // The carousel owns which design is showing; follow it.
  useEffect(() => {
    if (!api) return;
    const sync = () => setDesign(PUBMAT_DESIGN_IDS[api.selectedScrollSnap()]);
    sync();
    api.on("select", sync);
    api.on("reInit", sync);
    return () => {
      api.off("select", sync);
      api.off("reInit", sync);
    };
  }, [api]);

  // Once the design on show is drawn, start on the ones next to it.
  const settled = !!current && current.status !== "loading";
  useEffect(() => {
    if (!settled) return;
    const at = PUBMAT_DESIGN_IDS.indexOf(design);
    const next = [-1, 0, 1].map(
      (by) => PUBMAT_DESIGN_IDS[(at + by + count) % count],
    );
    setWarm((seen) =>
      next.every((id) => seen.has(id)) ? seen : new Set([...seen, ...next]),
    );
  }, [settled, design, count]);

  const download = () => {
    if (!current?.image) return;
    const a = document.createElement("a");
    a.href = current.image.url;
    a.download = pubmatFileName(job);
    a.click();
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex w-full flex-col items-center gap-3">
        <Carousel
          opts={{ loop: true }}
          setApi={setApi}
          style={{ width: `min(100%, ${maxPreviewSize}px)` }}
        >
          <CarouselContent>
            {PUBMAT_DESIGN_IDS.map((id) => (
              <CarouselItem key={id}>
                <PubmatSlide
                  job={job}
                  link={link}
                  design={id}
                  wanted={id === design || warm.has(id)}
                  onChange={handleSlide}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {count > 1 && (
            <>
              <CarouselPrevious className="-left-4 z-20 bg-white/90" />
              <CarouselNext className="-right-4 z-20 bg-white/90" />
            </>
          )}
        </Carousel>

        {count > 1 && (
          <div className="flex flex-col items-center gap-1.5">
            <div
              role="tablist"
              aria-label="Pubmat design"
              className="flex items-center gap-1.5"
            >
              {PUBMAT_DESIGN_IDS.map((id, at) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={id === design}
                  aria-label={PUBMAT_DESIGNS[id].label}
                  onClick={() => api?.scrollTo(at)}
                  className={cn(
                    "h-2 cursor-pointer rounded-full transition-all",
                    id === design
                      ? "w-5 bg-primary"
                      : "w-2 bg-gray-300 hover:bg-gray-400",
                  )}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-gray-600">
              {PUBMAT_DESIGNS[design].label}
            </span>
          </div>
        )}
      </div>

      <PubmatActions
        job={job}
        link={link}
        image={current?.image}
        status={current?.status ?? "loading"}
        onDownload={download}
      />
    </div>
  );
}
