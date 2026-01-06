"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  GlobalWorkerOptions,
  getDocument,
  version as pdfjsVersion,
} from "pdfjs-dist";
import type {
  PDFDocumentProxy,
  PDFPageProxy,
  RenderTask,
} from "pdfjs-dist/types/src/display/api";
import type { PageViewport } from "pdfjs-dist/types/src/display/display_utils";
import { type IFormBlock } from "@betterinternship/core/forms";
import { Loader } from "@/components/ui/loader";
import { ZoomIn, ZoomOut } from "lucide-react";

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

// Measure text width using Canvas (used by wrapText)
function measureTextWidth(text: string, fontSize: number): number {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0;
  ctx.font = `${fontSize}px Roboto`;
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
}: {
  text: string;
  fontSize: number;
  maxWidth: number;
}): string[] {
  const paragraphs = String(text ?? "").split(/\r?\n/);
  const lines: string[] = [];
  const measure = (s: string) => measureTextWidth(s, fontSize);

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
}: {
  text: string;
  fontSize: number;
  lineHeight: number;
  maxWidth: number;
  zoom?: number;
}) {
  const { ascent, descent } = getFontMetricsAtSize(fontSize);
  const lines = wrapText({ text, fontSize, maxWidth, zoom });
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
}: {
  text: string;
  maxWidth: number;
  maxHeight: number;
  startSize: number;
  lineHeightMult?: number;
  zoom?: number;
}) {
  const fits = (size: number): boolean => {
    const lh = size * lineHeightMult;
    const { blockHeight } = layoutWrappedBlock({
      text,
      fontSize: size,
      lineHeight: lh,
      maxWidth,
      zoom,
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
  });
  return { fontSize: bestSize, lineHeight: bestLineHeight, ...laid };
}

// For non-wrapping fields: find the largest font size that fits text on ONE line
function fitNoWrap({
  text,
  maxWidth,
  maxHeight,
  startSize,
}: {
  text: string;
  maxWidth: number;
  maxHeight: number;
  startSize: number;
}) {
  const line = String(text ?? "").replace(/\r?\n/g, " ");

  // TWEAK THIS VALUE: Higher = more aggressive shrinking (more safety margin)
  // Try: 2 (minimal), 4 (conservative), 8 (moderate), 12 (aggressive)
  const SAFETY_MARGIN = 0;

  const fits = (size: number): boolean => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    ctx.font = `${size}px Roboto`;
    // Measure text width with a small correction factor for safety
    // TWEAK THIS: 1.0 (most lenient), 1.05, 1.1, 1.15 (most conservative)
    const w = ctx.measureText(line).width * 0.68;
    const { height } = getFontMetricsAtSize(size);
    return w <= maxWidth - SAFETY_MARGIN && height <= maxHeight - SAFETY_MARGIN;
  };

  // If startSize already fits, return it
  if (fits(startSize)) {
    const { ascent, descent, height } = getFontMetricsAtSize(startSize);
    return { fontSize: startSize, line, ascent, descent, height };
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
  return { fontSize: bestSize, line, ascent, descent, height };
}

interface FormPreviewPdfDisplayProps {
  documentUrl: string;
  blocks: any[]; // ServerField[] with coordinates (x, y, w, h, page, field)
  values: Record<string, string>;
  scale?: number;
  onFieldClick?: (fieldName: string) => void;
  selectedFieldId?: string;
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
  blocks,
  values,
  scale: initialScale = 1.0,
  onFieldClick,
  selectedFieldId,
}: FormPreviewPdfDisplayProps) => {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [scale, setScale] = useState<number>(initialScale);
  const [visiblePage, setVisiblePage] = useState<number>(1);
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [isLoadingDoc, setIsLoadingDoc] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [animatingFieldId, setAnimatingFieldId] = useState<string | null>(null);

  const pageRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());

  // Jump to field's page and trigger animation when selected from form
  useEffect(() => {
    if (!selectedFieldId) return;

    const selectedField = blocks.find((b) => b.field === selectedFieldId);
    if (selectedField && selectedField.page) {
      const fieldPage = selectedField.page;
      setSelectedPage(fieldPage);
      const pageNode = pageRefs.current.get(fieldPage);
      pageNode?.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    // Trigger bump animation
    setAnimatingFieldId(selectedFieldId);
    const timeout = setTimeout(() => setAnimatingFieldId(null), 600);
    return () => clearTimeout(timeout);
  }, [selectedFieldId, blocks]);

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
          setError(err.message || "Failed to load PDF");
          setPdfDoc(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDoc(false);
      });

    return () => {
      cancelled = true;
      loadingTask.destroy();
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

  const handleJumpToPage = (page: number) => {
    if (!page || page < 1 || page > pageCount) return;
    setSelectedPage(page);
    const node = pageRefs.current.get(page);
    node?.scrollIntoView({ behavior: "smooth", block: "start" });
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
      <div className="flex-shrink-0 border-b border-slate-300 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700">
              Page {visiblePage} of {pageCount}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleZoom("out")}
              className="rounded p-2 hover:bg-slate-100"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="w-12 text-center text-sm font-medium text-slate-700">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => handleZoom("in")}
              className="rounded p-2 hover:bg-slate-100"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Pages container */}
      <div className="flex-1 overflow-x-auto overflow-y-auto bg-slate-100 p-4">
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
              blocks={blocks.filter((b) => {
                // Handle both IFormBlock and ServerField formats
                const page = b.page || b.field_schema?.page;
                return page === pageNumber;
              })}
              values={values}
              onFieldClick={onFieldClick}
              animatingFieldId={animatingFieldId}
              selectedFieldId={selectedFieldId}
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
  blocks: IFormBlock[];
  values: Record<string, string>;
  onFieldClick?: (fieldName: string) => void;
  animatingFieldId?: string | null;
  selectedFieldId?: string;
}

const PdfPageWithFields = ({
  pdf,
  pageNumber,
  scale,
  isVisible,
  onVisible,
  registerPageRef,
  blocks,
  values,
  onFieldClick,
  animatingFieldId,
  selectedFieldId,
}: PdfPageWithFieldsProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewportRef = useRef<PageViewport | null>(null);
  const [rendering, setRendering] = useState<boolean>(false);
  const [forceRender, setForceRender] = useState<number>(0);

  // offscreen canvas for text measurement
  

  useEffect(
    () => registerPageRef(pageNumber, containerRef.current),
    [pageNumber, registerPageRef],
  );

  // Force re-render of field positions when scale changes
  useEffect(() => {
    setForceRender((prev) => prev + 1);
  }, [scale]);

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
      <div className="absolute inset-0" key={forceRender}>
        {blocks.map((block) => {
          const x = block.x || 0;
          const y = block.y || 0;
          const w = block.w || 0;
          const h = block.h || 0;
          const fieldName = block.field;
          const label = block.label || fieldName;

          if (!x || !y || !w || !h) {
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
          // Handle different value types (string, array, object, etc)
          const valueStr = Array.isArray(rawValue)
            ? rawValue.join(", ")
            : typeof rawValue === "string"
              ? rawValue
              : "";
          const isFilled = valueStr.trim().length > 0;

          // Get alignment and wrapping from field schema
          const align_h = block.align_h ?? "left";
          const align_v = block.align_v ?? "top";
          const shouldWrap = block.wrap ?? true;

          // Calculate optimal font size using PDF engine algorithm
          const fieldType =
            block.field_schema?.type ||
            block.phantom_field_schema?.type ||
            block.type;

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
                startSize: block.field_schema?.size ?? 11,
                lineHeightMult: 1.0,
                zoom: scale,
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
                startSize: block.field_schema?.size ?? defaultSize,
              });

              fontSize = fitted.fontSize;
              lineHeight = fontSize * 1.0;
              displayLines = [fitted.line];
            }
          } else {
            fontSize = block.field_schema?.size ?? 11;
            lineHeight = fontSize * 1.0;
          }

          const isSelected =
            animatingFieldId === fieldName || selectedFieldId === fieldName;

          return (
            <div
              key={fieldName}
              onClick={() => onFieldClick?.(fieldName)}
              className={`absolute cursor-pointer text-black transition-all ${isSelected ? "bg-green-300" : "bg-blue-200"} `}
              style={{
                left: `${displayPos.displayX}px`,
                top: `${displayPos.displayY}px`,
                width: `${Math.max(widthPixels, 10)}px`,
                height: `${Math.max(heightPixels, 10)}px`,
                overflow: "hidden",
                display: "flex",
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
              title={`${label}: ${valueStr}`}
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
            </div>
          );
        })}
      </div>
    </div>
  );
};
