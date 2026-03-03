"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  GlobalWorkerOptions,
  getDocument,
  version as pdfjsVersion,
} from "pdfjs-dist";
import { type IFormSigningParty } from "@betterinternship/core/forms";
import type {
  PDFDocumentProxy,
  PDFPageProxy,
  RenderTask,
} from "pdfjs-dist/types/src/display/api";
import type { PageViewport } from "pdfjs-dist/types/src/display/display_utils";
import { Loader } from "@/components/ui/loader";
import { ZoomIn, ZoomOut } from "lucide-react";
import { useDbRefs } from "@/lib/db/use-refs";
import {
  groupFieldsByPage,
  normalizePreviewFields,
  type PreviewField,
  type PreviewFieldLike,
} from "@/lib/form-previewer-model";

// Load Roboto font from Google Fonts and wait for it to load
if (typeof window !== "undefined") {
  const link = document.createElement("link");
  link.href =
    "https://fonts.googleapis.com/css2?family=Roboto:wght@400&family=Italianno&display=block";
  link.rel = "stylesheet";
  document.head.appendChild(link);

  // Ensure fonts are loaded before using them
  if ("fonts" in document) {
    document.fonts.ready.catch(() => {
      // Font loading failed, but continue anyway
    });
  }
}

// Text wrapping and fitting utilities (matches PDF engine exactly)

// Shared canvas for text measurements (optimization to avoid creating new canvases)
let sharedCanvas: HTMLCanvasElement | null = null;
let sharedCtx: CanvasRenderingContext2D | null = null;

// Cache for fitNoWrap results to avoid recalculating (optimization for signatures/repeated fields)
const fitNoWrapCache = new Map<
  string,
  {
    fontSize: number;
    line: string;
    ascent: number;
    descent: number;
    height: number;
  }
>();

function getSharedContext(): CanvasRenderingContext2D | null {
  if (!sharedCanvas) {
    sharedCanvas = document.createElement("canvas");
    sharedCtx = sharedCanvas.getContext("2d");
  }
  return sharedCtx;
}

// Measure text width using Canvas (used by wrapText)
function measureTextWidth(
  text: string,
  fontSize: number,
  fontFamily = "Roboto",
): number {
  const ctx = getSharedContext();
  if (!ctx) return 0;
  ctx.font = `${fontSize}px ${fontFamily}`;
  return ctx.measureText(text).width;
}

// Get font metrics (approximated for browser, matching PDF engine approach)
function getFontMetricsAtSize(fontSize: number) {
  const ascent = fontSize * 0.8;
  const descent = -fontSize * 0.26;
  return {
    ascent,
    descent,
    height: ascent - descent,
  };
}

// Wrap text into lines that fit maxWidth (matches PDF engine)
function wrapText({
  text,
  fontSize,
  maxWidth,
  zoom = 1,
  fontFamily = "Roboto",
}: {
  text: string;
  fontSize: number;
  maxWidth: number;
  zoom?: number;
  fontFamily?: string;
}): string[] {
  const paragraphs = String(text ?? "").split(/\r?\n/);
  const lines: string[] = [];
  const measure = (s: string) =>
    measureTextWidth(s, fontSize, fontFamily) * zoom;

  const breakLongWord = (word: string): string[] => {
    const parts: string[] = [];
    let cur = "";
    for (const ch of word) {
      const next = cur + ch;
      if (cur && measure(next) > maxWidth) {
        parts.push(cur);
        cur = ch;
      } else {
        cur = next;
      }
    }
    if (cur) parts.push(cur);
    return parts;
  };

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) {
      lines.push("");
      continue;
    }

    const words = trimmed.split(/\s+/);
    let current = "";

    for (const w of words) {
      const candidate = current ? `${current} ${w}` : w;

      if (measure(candidate) <= maxWidth) {
        current = candidate;
        continue;
      }

      if (current) {
        lines.push(current);
        current = "";
      }

      if (measure(w) <= maxWidth) {
        current = w;
      } else {
        const broken = breakLongWord(w);
        for (let i = 0; i < broken.length; i++) {
          if (i === broken.length - 1) current = broken[i];
          else lines.push(broken[i]);
        }
      }
    }

    if (current) lines.push(current);
  }

  return lines;
}

function layoutWrappedBlock({
  text,
  fontSize,
  lineHeight,
  maxWidth,
  zoom = 1,
  fontFamily = "Roboto",
}: {
  text: string;
  fontSize: number;
  lineHeight: number;
  maxWidth: number;
  zoom?: number;
  fontFamily?: string;
}) {
  const { ascent, descent } = getFontMetricsAtSize(fontSize);
  const lines = wrapText({ text, fontSize, maxWidth, zoom, fontFamily });
  const n = lines.length;
  const blockHeight = (n > 0 ? (n - 1) * lineHeight : 0) + (ascent - descent);
  return { lines, ascent, descent, blockHeight };
}

function fitWrapped({
  text,
  maxWidth,
  maxHeight,
  startSize,
  lineHeightMult = 1.2,
  zoom = 1,
  fontFamily = "Roboto",
}: {
  text: string;
  maxWidth: number;
  maxHeight: number;
  startSize: number;
  lineHeightMult?: number;
  zoom?: number;
  fontFamily?: string;
}) {
  const fits = (size: number): boolean => {
    const lh = size * lineHeightMult;
    const { blockHeight } = layoutWrappedBlock({
      text,
      fontSize: size,
      lineHeight: lh,
      maxWidth,
      zoom,
      fontFamily,
    });
    return blockHeight <= maxHeight + 1e-6;
  };

  if (fits(startSize)) {
    const lh = startSize * lineHeightMult;
    const laid = layoutWrappedBlock({
      text,
      fontSize: startSize,
      lineHeight: lh,
      maxWidth,
      zoom,
      fontFamily,
    });
    return { fontSize: startSize, lineHeight: lh, ...laid };
  }

  let hi = startSize;
  let lo = startSize;
  while (!fits(lo)) {
    lo /= 2;
    if (lo < 0.1) break;
  }

  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2;
    if (fits(mid)) lo = mid;
    else hi = mid;
  }

  const bestSize = lo;
  const bestLineHeight = bestSize * lineHeightMult;
  const laid = layoutWrappedBlock({
    text,
    fontSize: bestSize,
    lineHeight: bestLineHeight,
    maxWidth,
    zoom,
    fontFamily,
  });
  return { fontSize: bestSize, lineHeight: bestLineHeight, ...laid };
}

// For non-wrapping fields: find the largest font size that fits text on ONE line
function fitNoWrap({
  text,
  maxWidth,
  maxHeight,
  startSize,
  fontFamily = "Roboto",
}: {
  text: string;
  maxWidth: number;
  maxHeight: number;
  startSize: number;
  fontFamily?: string;
}) {
  const line = String(text ?? "").replace(/\r?\n/g, " ");

  // Create cache key from inputs - cache results to avoid recalculating
  const cacheKey = `${line}|${maxWidth}|${maxHeight}|${startSize}`;
  if (fitNoWrapCache.has(cacheKey)) {
    return fitNoWrapCache.get(cacheKey)!;
  }

  // TWEAK THIS VALUE: Higher = more aggressive shrinking (more safety margin)
  // Try: 2 (minimal), 4 (conservative), 8 (moderate), 12 (aggressive)
  const SAFETY_MARGIN = 0;

  // Use shared canvas context (optimization to avoid creating new canvases)
  const ctx = getSharedContext();

  const fits = (size: number): boolean => {
    if (!ctx) return false;
    ctx.font = `${size}px ${fontFamily}`;
    const w = ctx.measureText(line).width;
    const { height } = getFontMetricsAtSize(size);
    return w <= maxWidth - SAFETY_MARGIN && height <= maxHeight - SAFETY_MARGIN;
  };

  // If startSize already fits, return it
  if (fits(startSize)) {
    const { ascent, descent, height } = getFontMetricsAtSize(startSize);
    const result = { fontSize: startSize, line, ascent, descent, height };
    fitNoWrapCache.set(cacheKey, result);
    return result;
  }

  // Binary search down to find a size that fits
  let lo = startSize;
  while (!fits(lo)) {
    lo /= 2;
    if (lo < 0.1) break;
  }

  // Binary search up to find the largest size that fits
  let hi = startSize;
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2;
    if (fits(mid)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  const bestSize = lo;
  const { ascent, descent, height } = getFontMetricsAtSize(bestSize);
  const result = { fontSize: bestSize, line, ascent, descent, height };

  // Store in cache for future calls
  fitNoWrapCache.set(cacheKey, result);

  return result;
}

interface FormPreviewPdfDisplayProps {
  documentUrl: string;
  fields?: PreviewFieldLike[];
  blocks?: PreviewFieldLike[]; // Backward-compatible alias
  values: Record<string, string>;
  scale?: number;
  onFieldClick?: (fieldName: string) => void;
  selectedFieldId?: string;
  selectionTick?: number;
  autoScrollToSelectedField?: boolean;
  fieldErrors?: Record<string, string>;
  signingParties?: IFormSigningParty[];
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * PDF display component that shows form fields as boxes overlaid on the PDF
 * Similar to PdfViewer but in read-only preview mode
 * Shows field boxes with current filled values
 */
export const FormPreviewPdfDisplay = ({
  documentUrl,
  fields,
  blocks,
  values,
  scale: initialScale = 1.0,
  onFieldClick,
  selectedFieldId,
  selectionTick = 0,
  autoScrollToSelectedField = true,
  fieldErrors = {},
  signingParties = [],
}: FormPreviewPdfDisplayProps) => {
  const refs = useDbRefs();
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [scale, setScale] = useState<number>(initialScale);
  const [visiblePage, setVisiblePage] = useState<number>(1);
  const [isLoadingDoc, setIsLoadingDoc] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [animatingFieldId, setAnimatingFieldId] = useState<string | null>(null);

  const pageRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());
  const fieldRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const normalizedFields = useMemo(
    () => normalizePreviewFields(fields?.length ? fields : (blocks ?? [])),
    [fields, blocks],
  );
  const fieldsByPage = useMemo(
    () => groupFieldsByPage(normalizedFields),
    [normalizedFields],
  );
  const signingPartyLabelById = useMemo(() => {
    const partyLabelById = new Map<string, string>();
    signingParties.forEach((party) => {
      partyLabelById.set(party._id, party.signatory_title || party._id);
    });
    return partyLabelById;
  }, [signingParties]);

  const resolveDisplayValue = useCallback(
    (fieldName: string, rawValue: unknown): string => {
      const value = Array.isArray(rawValue)
        ? rawValue.join(", ")
        : typeof rawValue === "string"
          ? rawValue
          : "";
      if (!value) return "";
      const trimmedValue = value.trim();

      const tryResolveRefName = (candidate: string): string | null => {
        const college = refs.get_college?.(candidate)?.name;
        if (college) return college;
        const department = refs.get_department?.(candidate)?.name;
        if (department) return department;
        const university = refs.get_university?.(candidate)?.name;
        if (university) return university;
        return null;
      };

      const loweredFieldName = fieldName.toLowerCase();
      if (
        loweredFieldName.includes("college") &&
        typeof refs.to_college_name === "function"
      ) {
        return refs.to_college_name(trimmedValue, trimmedValue) ?? trimmedValue;
      }
      if (
        loweredFieldName.includes("department") &&
        typeof refs.to_department_name === "function"
      ) {
        return (
          refs.to_department_name(trimmedValue, trimmedValue) ?? trimmedValue
        );
      }
      if (
        loweredFieldName.includes("university") &&
        typeof refs.to_university_name === "function"
      ) {
        return (
          refs.to_university_name(trimmedValue, trimmedValue) ?? trimmedValue
        );
      }

      const directRefMatch = tryResolveRefName(trimmedValue);
      if (directRefMatch) return directRefMatch;

      return value;
    },
    [refs],
  );

  const registerFieldRef = useCallback(
    (fieldName: string, node: HTMLDivElement | null) => {
      if (!node) {
        fieldRefs.current.delete(fieldName);
        return;
      }
      fieldRefs.current.set(fieldName, node);
    },
    [],
  );

  // Jump to field's page and trigger animation when selected from form
  useEffect(() => {
    if (!selectedFieldId) return;

    if (autoScrollToSelectedField) {
      const selectedFieldNode = fieldRefs.current.get(selectedFieldId);
      const scrollContainer = scrollContainerRef.current;

      if (selectedFieldNode && scrollContainer) {
        const containerRect = scrollContainer.getBoundingClientRect();
        const fieldRect = selectedFieldNode.getBoundingClientRect();
        const isVisible =
          fieldRect.top >= containerRect.top &&
          fieldRect.bottom <= containerRect.bottom;

        if (!isVisible) {
          selectedFieldNode.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
        }
      } else {
        const selectedField = normalizedFields.find(
          (field) => field.field === selectedFieldId,
        );
        if (selectedField && selectedField.page) {
          const fieldPage = selectedField.page;
          const pageNode = pageRefs.current.get(fieldPage);
          pageNode?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }

    // Trigger bump animation
    setAnimatingFieldId(selectedFieldId);
    const timeout = setTimeout(() => setAnimatingFieldId(null), 600);
    return () => clearTimeout(timeout);
  }, [
    selectedFieldId,
    selectionTick,
    normalizedFields,
    autoScrollToSelectedField,
  ]);

  // Initialize PDF.js worker
  useEffect(() => {
    if (typeof window === "undefined") return;
    const workerFile = pdfjsVersion.startsWith("4")
      ? "pdf.worker.min.mjs"
      : "pdf.worker.min.js";
    GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/${workerFile}`;
  }, []);

  // Load PDF document
  useEffect(() => {
    if (!documentUrl) return;

    setIsLoadingDoc(true);
    let cancelled = false;
    const loadingTask = getDocument({ url: documentUrl });

    loadingTask.promise
      .then((doc) => {
        if (!cancelled) {
          setPdfDoc(doc);
          setPageCount(doc.numPages);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const message =
            err && typeof err === "object" && "message" in err
              ? String(
                  (err as { message?: string }).message || "Failed to load PDF",
                )
              : "Failed to load PDF";
          setError(message);
          setPdfDoc(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDoc(false);
      });

    return () => {
      cancelled = true;
      void loadingTask.destroy();
    };
  }, [documentUrl]);

  const registerPageRef = useCallback(
    (page: number, node: HTMLDivElement | null) => {
      pageRefs.current.set(page, node);
    },
    [],
  );

  const handleZoom = (direction: "in" | "out") => {
    const delta = direction === "in" ? 0.1 : -0.1;
    setScale((prev) => clamp(parseFloat((prev + delta).toFixed(2)), 0.5, 3));
  };

  const pagesArray = useMemo(
    () => Array.from({ length: pageCount }, (_, idx) => idx + 1),
    [pageCount],
  );

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100">
        <div className="text-center">
          <p className="text-sm text-red-500">Failed to load PDF</p>
          <p className="mt-1 text-xs text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoadingDoc || !pdfDoc) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-[0.33em] border border-slate-300">
      {/* Top Controls */}
      <div className="flex-shrink-0 border-b border-slate-300 bg-white px-3 py-2">
        <div className="flex items-center justify-end gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-700">
              {visiblePage}/{pageCount}
            </span>
            <div className="ml-1 inline-flex items-center gap-1">
              <button
                onClick={() => handleZoom("out")}
                className="rounded p-1.5 hover:bg-slate-100"
                title="Zoom out"
                aria-label="Zoom out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleZoom("in")}
                className="rounded p-1.5 hover:bg-slate-100"
                title="Zoom in"
                aria-label="Zoom in"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>
            <span className="w-10 text-center text-[11px] font-medium text-slate-700">
              {Math.round(scale * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Pages container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto overflow-y-auto bg-slate-100 p-4"
      >
        <div className="mx-auto space-y-6">
          {pagesArray.map((pageNumber) => (
            <PdfPageWithFields
              key={pageNumber}
              pdf={pdfDoc}
              pageNumber={pageNumber}
              scale={scale}
              isVisible={Math.abs(visiblePage - pageNumber) <= 1}
              onVisible={() => setVisiblePage(pageNumber)}
              registerPageRef={registerPageRef}
              fields={fieldsByPage.get(pageNumber) || []}
              values={values}
              onFieldClick={onFieldClick}
              animatingFieldId={animatingFieldId}
              selectedFieldId={selectedFieldId}
              registerFieldRef={registerFieldRef}
              fieldErrors={fieldErrors}
              resolveDisplayValue={resolveDisplayValue}
              signingPartyLabelById={signingPartyLabelById}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface PdfPageWithFieldsProps {
  pdf: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  isVisible: boolean;
  onVisible: (page: number) => void;
  registerPageRef: (page: number, node: HTMLDivElement | null) => void;
  fields: PreviewField[];
  values: Record<string, string>;
  onFieldClick?: (fieldName: string) => void;
  animatingFieldId?: string | null;
  selectedFieldId?: string;
  registerFieldRef: (fieldName: string, node: HTMLDivElement | null) => void;
  fieldErrors: Record<string, string>;
  resolveDisplayValue: (fieldName: string, rawValue: unknown) => string;
  signingPartyLabelById: Map<string, string>;
}

const PdfPageWithFields = ({
  pdf,
  pageNumber,
  scale,
  isVisible: _isVisible,
  onVisible,
  registerPageRef,
  fields,
  values,
  onFieldClick,
  animatingFieldId,
  selectedFieldId,
  registerFieldRef,
  fieldErrors,
  resolveDisplayValue,
  signingPartyLabelById,
}: PdfPageWithFieldsProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewportRef = useRef<PageViewport | null>(null);
  const [rendering, setRendering] = useState<boolean>(false);
  const [forceRender, setForceRender] = useState<number>(0);
  const [hoveredFieldId, setHoveredFieldId] = useState<string | null>(null);
  const [activeTouchFieldId, setActiveTouchFieldId] = useState<string | null>(
    null,
  );
  const [isTouchInteraction, setIsTouchInteraction] = useState(false);
  const [clickedHighlightFieldId, setClickedHighlightFieldId] = useState<
    string | null
  >(null);

  // offscreen canvas for text measurement

  useEffect(
    () => registerPageRef(pageNumber, containerRef.current),
    [pageNumber, registerPageRef],
  );

  // Force re-render of field positions when scale changes
  useEffect(() => {
    setForceRender((prev) => prev + 1);
  }, [scale]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(hover: none), (pointer: coarse)");
    const update = () => setIsTouchInteraction(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  // Setup intersection observer for visibility
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onVisible(pageNumber);
        }
      },
      { threshold: 0.6 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [onVisible, pageNumber]);

  // Render PDF page
  useEffect(() => {
    let renderTask: RenderTask | null = null;
    let cancelled = false;
    setRendering(true);

    pdf
      .getPage(pageNumber)
      .then((page: PDFPageProxy) => {
        // Account for device pixel ratio for crisp rendering on high-DPI displays
        const dpr =
          typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
        const viewport = page.getViewport({ scale: scale * dpr });
        viewportRef.current = viewport;

        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Set CSS pixel size to match logical size (divided by dpr)
        canvas.style.width = `${viewport.width / dpr}px`;
        canvas.style.height = `${viewport.height / dpr}px`;

        const canvasContext = canvas.getContext("2d");
        if (!canvasContext) return;

        renderTask = page.render({
          canvasContext,
          viewport,
        });

        return renderTask.promise;
      })
      .catch((err) => {
        if (!cancelled)
          console.error(`Failed to render page ${pageNumber}:`, err);
      })
      .finally(() => {
        if (!cancelled) setRendering(false);
      });

    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [pdf, pageNumber, scale]);

  // Convert PDF coordinates to display coordinates, accounting for zoom-aware rendering
  const pdfToDisplay = (
    pdfX: number,
    pdfY: number,
  ): { displayX: number; displayY: number } | null => {
    const canvas = canvasRef.current;
    const viewport = viewportRef.current;
    if (!canvas || !viewport) return null;

    // Metadata coordinates already use top-left origin (y=0 at top)
    // Scale them directly to display coordinates
    const displayX = pdfX * scale;
    const displayY = pdfY * scale;

    return {
      displayX,
      displayY,
    };
  };

  return (
    <div
      ref={containerRef}
      className="relative mx-auto rounded bg-white shadow"
      style={{
        width: "fit-content",
      }}
    >
      {rendering && (
        <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-white">
          <Loader />
        </div>
      )}

      {/* Canvas - PDF page */}
      <canvas ref={canvasRef} className="block" />

      {/* Field boxes overlay */}
      <div
        className="absolute inset-0"
        key={forceRender}
        onClick={() => {
          if (isTouchInteraction) setActiveTouchFieldId(null);
        }}
      >
        {fields.map((field) => {
          const x = field.x;
          const y = field.y;
          const w = field.w;
          const h = field.h;
          const fieldName = field.field;
          if (w <= 0 || h <= 0) {
            return null;
          }

          const displayPos = pdfToDisplay(x, y);
          if (!displayPos) {
            return null;
          }

          const rect = canvasRef.current?.getBoundingClientRect();
          const canvas = canvasRef.current;
          if (!rect || !canvas) return null;

          // Canvas internal resolution is scaled by DPR, but CSS size compensates
          // We only need the scale factor, not DPR-adjusted dimensions
          const widthPixels = w * scale;
          const heightPixels = h * scale;

          const rawValue = values[fieldName];
          const valueStr = resolveDisplayValue(fieldName, rawValue);
          const isFilled = valueStr.trim().length > 0;

          // Get alignment and wrapping from field schema
          const align_h = field.align_h ?? "left";
          const align_v = field.align_v ?? "top";
          const shouldWrap = field.wrap ?? true;

          // Calculate optimal font size using PDF engine algorithm
          const fieldType = field.type;

          let fontSize: number;
          let lineHeight: number;
          let displayLines: string[] = [];

          if (isFilled) {
            if (shouldWrap) {
              // Use exact PDF engine algorithm for text with wrapping (no padding)
              const fitted = fitWrapped({
                text: valueStr,
                maxWidth: widthPixels,
                maxHeight: heightPixels,
                startSize: field.size ?? 11,
                lineHeightMult: 1.0,
                zoom: scale,
                fontFamily: fieldType === "signature" ? "Italianno" : "Roboto",
              });
              fontSize = fitted.fontSize;
              lineHeight = fitted.lineHeight;
              displayLines = fitted.lines || [];
            } else {
              // No wrapping - find largest font size that fits on ONE line
              const defaultSize = fieldType === "signature" ? 25 : 11;
              const fitted = fitNoWrap({
                text: valueStr,
                maxWidth: widthPixels,
                maxHeight: heightPixels,
                startSize: field.size ?? defaultSize,
                fontFamily: fieldType === "signature" ? "Italianno" : "Roboto",
              });

              fontSize = fitted.fontSize;
              lineHeight = fontSize * 1.0;
              displayLines = [fitted.line];
            }
          } else {
            fontSize = field.size ?? 11;
            lineHeight = fontSize * 1.0;
          }

          const isSelected =
            animatingFieldId === fieldName ||
            selectedFieldId === fieldName ||
            clickedHighlightFieldId === field.id;
          const isOwnedByInitiator = field.signing_party_id === "initiator";
          const hasFieldError = !!fieldErrors[fieldName];
          const isFieldValid = isFilled && !hasFieldError;
          const borderColor = isOwnedByInitiator
            ? isFieldValid
              ? "#16a34a"
              : "#dc2626"
            : "#d1d5db";
          const fillColor = isOwnedByInitiator
            ? isFieldValid
              ? "rgba(34, 197, 94, 0.2)"
              : "rgba(239, 68, 68, 0.2)"
            : "transparent";
          const isClickable = isOwnedByInitiator;
          const ownerLabel = field.signing_party_id
            ? (signingPartyLabelById.get(field.signing_party_id) ??
              "Unassigned")
            : "Unassigned";
          const showOwnerTooltip =
            !isClickable &&
            (hoveredFieldId === field.id ||
              (isTouchInteraction && activeTouchFieldId === field.id));

          return (
            <div
              key={field.id}
              onMouseEnter={() => {
                if (!isClickable) setHoveredFieldId(field.id);
              }}
              onMouseLeave={() => {
                if (hoveredFieldId === field.id) setHoveredFieldId(null);
              }}
              onClick={(event) => {
                event.stopPropagation();
                if (isTouchInteraction) {
                  if (activeTouchFieldId !== field.id) {
                    setActiveTouchFieldId(field.id);
                    return;
                  }
                  setActiveTouchFieldId(null);
                }
                setClickedHighlightFieldId(field.id);
                setTimeout(
                  () =>
                    setClickedHighlightFieldId((prev) =>
                      prev === field.id ? null : prev,
                    ),
                  550,
                );
                if (!isClickable) return;
                onFieldClick?.(fieldName);
              }}
              ref={(node) => registerFieldRef(fieldName, node)}
              className={`absolute text-black transition-all ${
                isClickable ? "cursor-pointer" : "cursor-default"
              }`}
              style={{
                left: `${displayPos.displayX}px`,
                top: `${displayPos.displayY}px`,
                width: `${Math.max(widthPixels, 10)}px`,
                minHeight: `${Math.max(heightPixels, 10)}px`,
                overflow: "visible",
                display: "flex",
                backgroundColor: fillColor,
                border: isSelected
                  ? `2px solid ${borderColor}`
                  : `1px solid ${borderColor}`,
                alignItems:
                  align_v === "middle"
                    ? "center"
                    : align_v === "bottom"
                      ? "flex-end"
                      : "flex-start",
                justifyContent:
                  align_h === "center"
                    ? "center"
                    : align_h === "right"
                      ? "flex-end"
                      : "flex-start",
              }}
            >
              {isFilled && (
                <div
                  className={
                    fieldType === "signature" ? "text-blue-600" : "text-black"
                  }
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: `${lineHeight}px`,
                    overflow: "visible",
                    whiteSpace: shouldWrap ? "pre-wrap" : "nowrap",
                    wordWrap: shouldWrap ? "break-word" : "normal",
                    width: "100%",
                    padding: "0px",
                    margin: "0px",
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "inherit",
                    justifyContent: "inherit",
                    textAlign: align_h === "center" ? "center" : align_h,
                    fontFamily:
                      fieldType === "signature"
                        ? "Italianno, cursive"
                        : "Roboto, sans-serif",
                    fontWeight: fieldType === "signature" ? "normal" : "600",
                    color: fieldType === "signature" ? "#0000FF" : "#000000",
                  }}
                >
                  {displayLines.length > 0 ? displayLines.join("\n") : valueStr}
                </div>
              )}
              {showOwnerTooltip ? (
                <AssignedOwnerTooltip ownerLabel={ownerLabel} />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AssignedOwnerTooltip = ({ ownerLabel }: { ownerLabel: string }) => (
  <div className="pointer-events-none absolute -top-8 left-0 z-20 max-w-56 rounded border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-700 shadow-lg">
    <span className="leading-[1.2] break-words">{ownerLabel}</span>
  </div>
);
