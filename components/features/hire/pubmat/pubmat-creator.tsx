"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { ImageOff, Loader2, Pause, RotateCw } from "lucide-react";
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
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Job } from "@/lib/db/db.types";
import {
  DEFAULT_PUBMAT_DESIGN,
  PUBMAT_DESIGN_IDS,
  PUBMAT_DESIGNS,
  type PubmatDesign,
} from "@/lib/pubmat/designs";
import { DotMatrix } from "@/components/ui/dot-matrix";
import { PubmatActions } from "./pubmat-actions";
import { pubmatFileName, usePubmatImage } from "./use-pubmat-image";
import { downloadPoster } from "@/lib/pubmat/preview";
import type { PosterCopy } from "@/lib/pubmat/core";
import { pubmatDataFromJob } from "@/lib/pubmat/from-job";
import { DEFAULT_PUBMAT_DESCRIPTION } from "@/lib/pubmat/params";
import { useDbRefs } from "@/lib/db/use-refs";
import { PubmatTextEditor } from "./pubmat-text-editor";

/**
 * A listing's pubmat: swipe or page through its designs, then download it or
 * share it (pubmat-actions.tsx). Each slide is an <img> on its own drawn image's
 * object URL, and Download saves that same blob, so what's saved is what's
 * shown, and nothing is sent to a server (see use-pubmat-image.ts).
 *
 * Drawing is the expensive part, so a slide only draws once it's wanted: the
 * design on show first, then the three either side of it, nearest first, so a
 * swipe usually lands on a finished preview. Anything further away hands its
 * picture back, which keeps a fourteen-slide carousel from holding fourteen
 * 1080px images at once.
 */

type SlideState = Pick<ReturnType<typeof usePubmatImage>, "image" | "status">;

/** How many designs either side of the one on show stay drawn. */
const WARM_RADIUS = 3;

function PubmatSlide({
  job,
  link,
  design,
  wanted,
  hold,
  onChange,
  copy,
  companyLogo,
  backgroundImage,
  backgroundPosition,
  paused,
}: {
  job: Job;
  link: string;
  design: PubmatDesign;
  /** Whether to draw this design yet. */
  wanted: boolean;
  /** Whether to keep the last drawing even while it isn't wanted. */
  hold: boolean;
  onChange: (design: PubmatDesign, state: SlideState) => void;
  copy: PosterCopy;
  companyLogo?: string | null;
  backgroundImage?: string;
  backgroundPosition?: { x: number; y: number; scale: number };
  paused: boolean;
}) {
  const tilt = useTilt();
  const { image, status, error, retry } = usePubmatImage(
    job,
    wanted ? link : undefined,
    design,
    copy,
    companyLogo,
    backgroundImage,
    backgroundPosition,
    hold,
  );

  // A tile with no poster on it is never an empty square: it holds the dot
  // matrix (components/ui/dot-matrix.tsx) until the picture lands — including
  // while you drag towards a slide that hasn't been drawn yet. A redraw behind
  // a poster that's already up keeps the poster and just says it's catching up.
  const drawing = !image && status !== "error";
  const updating = status === "loading" && !!image;
  const [pill, setPill] = useState(false);
  useEffect(() => {
    setPill(false);
    if (!updating) return;
    const timer = setTimeout(() => setPill(true), 120);
    return () => clearTimeout(timer);
  }, [updating]);

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
          className="relative size-full overflow-hidden rounded-[0.33em] border border-gray-200 bg-white shadow-md transition-transform duration-150 ease-out will-change-transform hover:shadow-xl motion-reduce:transition-none"
        >
          {drawing && (
            <div
              role="status"
              className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
            >
              <DotMatrix />
              <span className="sr-only">Generating the poster</span>
            </div>
          )}
          {pill && (
            <div className="pointer-events-none absolute right-2 top-2 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2 py-1 text-[0.65rem] font-medium tracking-wide text-gray-600 shadow-sm">
              <Loader2 className="size-3 animate-spin" aria-hidden="true" />
              Updating
            </div>
          )}
          {status === "error" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
              {/* A fit error from a live edit: keep the last good draw behind
                  the message so the poster doesn't vanish mid-typing. */}
              {image && (
                <img
                  src={image.url}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  className="absolute inset-0 size-full object-contain opacity-30"
                />
              )}
              <div className="relative flex flex-col items-center gap-2 rounded-lg bg-white/95 px-4 py-3 shadow-sm">
                <ImageOff className="size-6 text-gray-400" />
                <p className="text-sm text-gray-700">
                  {error ?? "Couldn’t make the pubmat."}
                </p>
                {!image && (
                  <Button variant="outline" size="sm" onClick={retry}>
                    <RotateCw />
                    Try again
                  </Button>
                )}
              </div>
            </div>
          ) : (
            image && (
              <>
                <img
                  src={image.url}
                  alt={`${PUBMAT_DESIGNS[design].label} pubmat for ${job.title ?? "your listing"}`}
                  // Dragging the picture would fight the carousel's own drag.
                  draggable={false}
                  className={cn(
                    "size-full select-none object-contain",
                    paused && "grayscale opacity-60",
                  )}
                />
                {paused && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-gray-500/15 p-4"
                  >
                    <div className="flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-sm font-semibold text-gray-700 shadow-md">
                      <Pause className="size-4" />
                      Listing paused
                    </div>
                  </div>
                )}
              </>
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
  companyLogo,
  backgroundImage,
  onBackgroundImageChange,
  backgroundPosition,
  onBackgroundPositionChange,
  sideBySide = false,
  onEdit,
  initiallyEditing = false,
  initialDesign = DEFAULT_PUBMAT_DESIGN,
}: {
  job: Job;
  /** The listing's short share link; the QR code opens it. */
  link: string;
  /** Biggest the preview gets, in px, so it doesn't swamp the page. */
  maxPreviewSize?: number;
  /** undefined resolves the profile logo; null explicitly shares without one. */
  companyLogo?: string | null;
  backgroundImage?: string;
  onBackgroundImageChange?: (value: string) => void;
  backgroundPosition?: { x: number; y: number; scale: number };
  onBackgroundPositionChange?: (value: {
    x: number;
    y: number;
    scale: number;
  }) => void;
  /** Put the text editor beside the preview instead of under it, when there's room. */
  sideBySide?: boolean;
  /** Open the editor elsewhere instead of expanding it beside the preview. */
  onEdit?: (design: PubmatDesign) => void;
  /** Open directly into the editor (used by the modal). */
  initiallyEditing?: boolean;
  /** Design to show first, so moving into the modal keeps the chosen poster. */
  initialDesign?: PubmatDesign;
}) {
  const paused = job.is_active === false || Boolean(job.paused);
  const [api, setApi] = useState<CarouselApi>();
  // When the pointer last moved over the carousel; background renders wait for
  // it to go quiet. A ref, not state: this changes on every move and must not
  // re-render fourteen slides.
  const lastPointer = useRef(0);
  const notePointer = useCallback(() => {
    lastPointer.current = performance.now();
  }, []);
  const [design, setDesign] = useState<PubmatDesign>(initialDesign);
  const [selectedBackground, setSelectedBackground] = useState(
    backgroundImage ?? PUBMAT_DESIGNS[initialDesign].backgrounds[0].id,
  );
  const [position, setPosition] = useState(
    backgroundPosition ?? { x: 0.5, y: 0.5, scale: 1 },
  );
  const [slides, setSlides] = useState<
    Partial<Record<PubmatDesign, SlideState>>
  >({});
  const [warm, setWarm] = useState<ReadonlySet<PubmatDesign>>(new Set());
  const refs = useDbRefs();
  const baseCopy = useMemo(() => {
    const listing = pubmatDataFromJob(job, refs, link);
    return {
      ...listing,
      setup: listing.workMode,
      description: DEFAULT_PUBMAT_DESCRIPTION,
    };
  }, [job, refs, link]);

  // Typing edits the draft; the poster follows a beat later, so a fast typist
  // doesn't trigger a redraw per keystroke.
  const [draft, setDraft] = useState<PosterCopy>({});
  const copy = useDebouncedValue(draft, 350);
  const [editing, setEditing] = useState(initiallyEditing && !paused);
  const identity = `${job.id ?? "listing"}|${link}|${initiallyEditing}|${initialDesign}|${paused}`;
  const previousIdentity = useRef(identity);
  useEffect(() => {
    if (previousIdentity.current === identity) return;
    previousIdentity.current = identity;
    setDraft({});
    setEditing(initiallyEditing && !paused);
    setDesign(initialDesign);
    setSelectedBackground(
      backgroundImage ?? PUBMAT_DESIGNS[initialDesign].backgrounds[0].id,
    );
    setPosition(backgroundPosition ?? { x: 0.5, y: 0.5, scale: 1 });
    setSlides({});
  }, [
    identity,
    initiallyEditing,
    initialDesign,
    backgroundImage,
    backgroundPosition,
    paused,
  ]);

  const count = PUBMAT_DESIGN_IDS.length;
  const current = slides[design];

  // Designs close enough to the one on show to be worth keeping drawn.
  const reach = useMemo(() => {
    const at = PUBMAT_DESIGN_IDS.indexOf(design);
    const ids = new Set<PubmatDesign>();
    for (let step = 1; step <= WARM_RADIUS; step++) {
      ids.add(PUBMAT_DESIGN_IDS[(at + step + count) % count]);
      ids.add(PUBMAT_DESIGN_IDS[(at - step + count) % count]);
    }
    return ids;
  }, [design, count]);

  // The nearest pair that isn't drawn yet, so the slide you're most likely to
  // swipe to is ready before the ones further out.
  const nextRing = useMemo(() => {
    const at = PUBMAT_DESIGN_IDS.indexOf(design);
    const drawn = (id: PubmatDesign) => {
      const status = slides[id]?.status;
      return status === "ready" || status === "error";
    };
    for (let step = 1; step <= WARM_RADIUS; step++) {
      const ids = [step, -step].map(
        (by) => PUBMAT_DESIGN_IDS[(at + by + count) % count],
      );
      if (ids.some((id) => !drawn(id))) return ids;
    }
    return [];
  }, [design, slides, count]);

  const handleSlide = useCallback(
    (id: PubmatDesign, state: SlideState) =>
      setSlides((all) => ({ ...all, [id]: state })),
    [],
  );

  // The carousel owns which design is showing; follow it once it comes to
  // rest. Not on `select`: embla picks the next snap as soon as a drag passes
  // halfway, so `select` fires with the finger still down — and a poster draw
  // takes the main thread for the best part of a second, which freezes the
  // drag. `settle` only fires when the gesture is over.
  useEffect(() => {
    if (!api) return;
    const sync = () => setDesign(PUBMAT_DESIGN_IDS[api.selectedScrollSnap()]);
    sync();
    api.on("settle", sync);
    api.on("reInit", sync);
    return () => {
      api.off("settle", sync);
      api.off("reInit", sync);
    };
  }, [api]);

  // Once the design on show is drawn, start on the ones next to it — but only
  // after a quiet moment, so a quick swipe doesn't pay for background renders,
  // and never while the text editor is open (every debounce tick would redraw
  // them all).
  //
  // Drawing shares the main thread with the tilt and the carousel drag, so a
  // background render that starts mid-gesture is what makes both stutter. Keep
  // waiting while the pointer is still moving.
  const settled = !!current && current.status !== "loading";
  useEffect(() => {
    if (!settled || editing || !nextRing.length) return;
    let timer: ReturnType<typeof setTimeout>;
    const start = () => {
      const quiet = performance.now() - lastPointer.current;
      if (quiet < 700) {
        timer = setTimeout(start, 700 - quiet);
        return;
      }
      setWarm((seen) =>
        nextRing.every((id) => seen.has(id))
          ? seen
          : new Set([...seen, ...nextRing]),
      );
    };
    timer = setTimeout(start, 400);
    return () => clearTimeout(timer);
  }, [settled, design, editing, nextRing]);

  // Forget anything that has slid out of reach — those slides hand their
  // pictures back (use-pubmat-image.ts) — and everything when the editor opens.
  useEffect(() => {
    setWarm((seen) => {
      const keep = new Set([...seen].filter((id) => !editing && reach.has(id)));
      return keep.size === seen.size ? seen : keep;
    });
  }, [reach, editing]);

  useEffect(() => {
    const presets = PUBMAT_DESIGNS[design].backgrounds;
    const valid =
      selectedBackground.startsWith("data:") ||
      presets.some((item) => item.id === selectedBackground);
    if (!valid) setSelectedBackground(presets[0].id);
  }, [design, selectedBackground]);

  const download = async () => {
    if (!current?.image || current.status !== "ready") return;
    await downloadPoster(current.image.getPng, pubmatFileName(job));
  };

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center gap-4",
        sideBySide &&
          "lg:flex-row lg:flex-wrap lg:items-start lg:justify-center lg:gap-8",
      )}
      style={
        sideBySide
          ? ({ "--pubmat-preview": `${maxPreviewSize}px` } as CSSProperties)
          : undefined
      }
    >
      <div
        className={cn(
          "flex w-full flex-col items-center gap-3",
          sideBySide && "lg:w-[var(--pubmat-preview)] lg:shrink-0",
        )}
        style={
          sideBySide
            ? ({
                "--pubmat-preview": `${maxPreviewSize}px`,
              } as CSSProperties)
            : undefined
        }
      >
        <Carousel
          opts={{
            loop: true,
            startIndex: PUBMAT_DESIGN_IDS.indexOf(initialDesign),
          }}
          setApi={setApi}
          onPointerMove={notePointer}
          onPointerDown={notePointer}
          style={{ width: `min(100%, ${maxPreviewSize}px)` }}
        >
          <CarouselContent>
            {PUBMAT_DESIGN_IDS.map((id) => (
              <CarouselItem key={id}>
                <PubmatSlide
                  job={job}
                  link={link}
                  design={id}
                  wanted={id === design || (!editing && warm.has(id))}
                  hold={reach.has(id)}
                  onChange={handleSlide}
                  copy={copy}
                  companyLogo={companyLogo}
                  backgroundImage={selectedBackground}
                  backgroundPosition={position}
                  paused={paused}
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
          <div className="flex w-full flex-col items-center gap-2 sm:flex-row sm:justify-center">
            {count > 1 && (
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
            )}
          </div>
        )}
      </div>

      {editing && !paused && (
        <div
          className={cn(
            "w-full",
            sideBySide &&
              "pubmat-editing lg:max-h-[var(--pubmat-preview)] lg:max-w-[600px] lg:flex-1 lg:overflow-y-auto lg:pr-2",
            "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-right-2 motion-safe:duration-200",
          )}
        >
          <PubmatTextEditor
            showDescription
            base={baseCopy}
            draft={draft}
            onChange={setDraft}
            onReset={() => setDraft({})}
            rendering={current?.status === "loading"}
            backgroundImage={selectedBackground}
            backgroundOptions={PUBMAT_DESIGNS[design].backgrounds}
            onBackgroundImageChange={(value) => {
              setSelectedBackground(value);
              onBackgroundImageChange?.(value);
            }}
            backgroundPosition={position}
            onBackgroundPositionChange={
              PUBMAT_DESIGNS[design].repositionBackground
                ? (value) => {
                    setPosition(value);
                    onBackgroundPositionChange?.(value);
                  }
                : undefined
            }
          />
        </div>
      )}

      <div
        key={editing ? "editing-actions" : "preview-actions"}
        className={cn(
          "w-full",
          editing && sideBySide && "lg:basis-full lg:flex lg:justify-end",
          "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-200",
        )}
      >
        <PubmatActions
          job={job}
          link={link}
          image={current?.image}
          status={current?.status ?? "loading"}
          onDownload={download}
          alignRight={editing && sideBySide}
          editing={editing}
          readOnly={paused}
          onEdit={() => {
            if (paused) return;
            if (editing) {
              setDraft({});
              setEditing(false);
            } else if (onEdit) onEdit(design);
            else setEditing(true);
          }}
        />
      </div>
    </div>
  );
}
