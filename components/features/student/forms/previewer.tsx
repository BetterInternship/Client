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
import { useProfileData } from "@/lib/api/student.data.api";
import { useAppContext } from "@/lib/ctx-app";
import {
  createPreviewDisplayValueResolver,
  groupFieldsByPage,
  normalizePreviewFieldKey,
  toPreviewFields,
  type PreviewField,
  type PreviewFieldInput,
} from "@/lib/form-previewer-model";
import {
  ensurePreviewFontsLoaded,
  fitNoWrapText,
  fitWrappedText,
  resolvePreviewFont,
} from "@/lib/form-previewer-rendering";
interface FormPreviewPdfDisplayProps {
  documentUrl: string;
  blocks?: PreviewFieldInput[];
  values: Record<string, string>;
  headerLeft?: React.ReactNode;
  scale?: number;
  onFieldClick?: (fieldName: string) => void;
  selectedFieldId?: string;
  selectionTick?: number;
  autoScrollToSelectedField?: boolean;
  fieldErrors?: Record<string, string>;
  signingParties?: IFormSigningParty[];
  wetSignatureMode?: boolean;
  hiddenFieldNames?: string[];
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
  headerLeft,
  scale: initialScale,
  onFieldClick,
  selectedFieldId,
  selectionTick = 0,
  autoScrollToSelectedField = true,
  fieldErrors = {},
  signingParties = [],
  wetSignatureMode = false,
  hiddenFieldNames = [],
}: FormPreviewPdfDisplayProps) => {
  const { isMobile } = useAppContext();
  const refs = useDbRefs();
  const profile = useProfileData();
  const defaultScale = isMobile ? 0.5 : 0.9;
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [scale, setScale] = useState<number>(initialScale ?? defaultScale);
  const [visiblePage, setVisiblePage] = useState<number>(1);
  const [isLoadingDoc, setIsLoadingDoc] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [contextLabelFieldId, setContextLabelFieldId] = useState<string | null>(
    null,
  );
  const [isContextLabelVisible, setIsContextLabelVisible] = useState(false);
  const CONTEXT_LABEL_VISIBLE_MS = 900;
  const CONTEXT_LABEL_TOTAL_MS = 1150;
  const previousValuesRef = useRef<Record<string, string>>({});
  const hasInitializedValueDiffRef = useRef(false);
  const contextLabelFadeTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const contextLabelClearTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const pageRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());
  const fieldRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const normalizedFields = useMemo(
    () => toPreviewFields(blocks ?? []),
    [blocks],
  );
  const hiddenFieldNameSet = useMemo(
    () => new Set(hiddenFieldNames.map(normalizePreviewFieldKey)),
    [hiddenFieldNames],
  );
  const displayFields = useMemo(
    () =>
      wetSignatureMode
        ? normalizedFields.filter(
            (field) =>
              field.type !== "signature" &&
              !hiddenFieldNameSet.has(normalizePreviewFieldKey(field.field)),
          )
        : normalizedFields,
    [hiddenFieldNameSet, normalizedFields, wetSignatureMode],
  );
  const fieldsByPage = useMemo(
    () => groupFieldsByPage(displayFields),
    [displayFields],
  );
  const signingPartyLabelById = useMemo(() => {
    const partyLabelById = new Map<string, string>();
    signingParties.forEach((party) => {
      partyLabelById.set(party._id, party.signatory_title || party._id);
    });
    return partyLabelById;
  }, [signingParties]);

  const resolveDisplayValue = useMemo(
    () =>
      createPreviewDisplayValueResolver({
        refs,
        user: profile.data as Record<string, unknown> | null,
      }),
    [refs, profile.data],
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

  const triggerContextLabel = useCallback((fieldId: string) => {
    setContextLabelFieldId(fieldId);
    setIsContextLabelVisible(true);

    if (contextLabelFadeTimeoutRef.current)
      clearTimeout(contextLabelFadeTimeoutRef.current);
    if (contextLabelClearTimeoutRef.current)
      clearTimeout(contextLabelClearTimeoutRef.current);

    contextLabelFadeTimeoutRef.current = setTimeout(
      () => setIsContextLabelVisible(false),
      CONTEXT_LABEL_VISIBLE_MS,
    );
    contextLabelClearTimeoutRef.current = setTimeout(
      () => setContextLabelFieldId(null),
      CONTEXT_LABEL_TOTAL_MS,
    );
  }, []);

  // Re-apply default zoom when a new document is opened.
  useEffect(() => {
    setScale(initialScale ?? defaultScale);
  }, [documentUrl, initialScale, defaultScale]);

  // Show contextual label when a mapped field value changes.
  useEffect(() => {
    if (!hasInitializedValueDiffRef.current) {
      hasInitializedValueDiffRef.current = true;
      previousValuesRef.current = values;
      return;
    }

    const previousValues = previousValuesRef.current;
    const changedKeys = Object.keys(values).filter(
      (key) => previousValues[key] !== values[key],
    );
    previousValuesRef.current = values;

    if (!changedKeys.length || isMobile) return;

    const changedFieldId = normalizePreviewFieldKey(changedKeys[0]);
    triggerContextLabel(changedFieldId);
  }, [values, isMobile, triggerContextLabel]);

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

    if (!isMobile && autoScrollToSelectedField) {
      triggerContextLabel(selectedFieldId);
    }
  }, [
    selectedFieldId,
    selectionTick,
    normalizedFields,
    autoScrollToSelectedField,
    isMobile,
    triggerContextLabel,
  ]);

  // Initialize PDF.js worker
  useEffect(() => {
    if (typeof window === "undefined") return;
    const workerFile = pdfjsVersion.startsWith("4")
      ? "pdf.worker.min.mjs"
      : "pdf.worker.min.js";
    GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/${workerFile}`;
  }, []);

  useEffect(() => {
    ensurePreviewFontsLoaded();
  }, []);

  useEffect(() => {
    return () => {
      if (contextLabelFadeTimeoutRef.current)
        clearTimeout(contextLabelFadeTimeoutRef.current);
      if (contextLabelClearTimeoutRef.current)
        clearTimeout(contextLabelClearTimeoutRef.current);
    };
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
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[0.33em]">
      {/* Top Controls */}
      <div className="flex-shrink-0 bg-white px-3 py-2">
        <div className="flex items-center gap-3">
          {headerLeft ? <div className="min-w-0">{headerLeft}</div> : null}
          <div className="ml-auto flex items-center gap-1.5">
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
        className="flex-1 min-h-0 overflow-x-auto overflow-y-auto overscroll-contain bg-slate-100 p-4"
        style={{ WebkitOverflowScrolling: "touch" }}
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
              selectedFieldId={selectedFieldId}
              contextLabelFieldId={contextLabelFieldId}
              isContextLabelVisible={isContextLabelVisible}
              registerFieldRef={registerFieldRef}
              fieldErrors={fieldErrors}
              resolveDisplayValue={resolveDisplayValue}
              signingPartyLabelById={signingPartyLabelById}
              wetSignatureMode={wetSignatureMode}
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
  selectedFieldId?: string;
  contextLabelFieldId?: string | null;
  isContextLabelVisible?: boolean;
  registerFieldRef: (fieldName: string, node: HTMLDivElement | null) => void;
  fieldErrors: Record<string, string>;
  resolveDisplayValue: (field: PreviewField, rawValue: unknown) => string;
  signingPartyLabelById: Map<string, string>;
  wetSignatureMode: boolean;
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
  selectedFieldId,
  contextLabelFieldId,
  isContextLabelVisible,
  registerFieldRef,
  fieldErrors,
  resolveDisplayValue,
  signingPartyLabelById,
  wetSignatureMode,
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

          const widthPixels = w * scale;
          const heightPixels = h * scale;

          const owner = String(field.signing_party_id ?? "").toLowerCase();
          const hasAssignedOwner = owner.length > 0;
          const isOwnedByInitiator =
            !hasAssignedOwner || owner === "initiator" || owner === "student";
          const shouldDisplayValue = wetSignatureMode || isOwnedByInitiator;
          const normalizedFieldName = normalizePreviewFieldKey(fieldName);
          const rawValue = shouldDisplayValue
            ? (values[fieldName] ??
              values[normalizedFieldName + ":default"] ??
              values[normalizedFieldName])
            : "";
          const valueStr = shouldDisplayValue
            ? resolveDisplayValue(field, rawValue)
            : "";
          const isFilled = valueStr.trim().length > 0;

          // Get alignment and wrapping from field schema
          const align_h = field.align_h ?? "left";
          const align_v = field.align_v ?? "top";
          const shouldWrap = field.wrap ?? true;

          // Calculate optimal font size using PDF engine algorithm
          const fieldType: PreviewField["type"] = field.type ?? "text";
          const resolvedFont = resolvePreviewFont(fieldType, field.font);

          let fontSizeDoc: number;
          let lineHeightDoc: number;
          let displayLines: string[] = [];
          const fitSafetyUnits = 2;
          const fitMaxWidthDoc = Math.max(0, w - fitSafetyUnits);
          const fitMaxHeightDoc = Math.max(0, h - fitSafetyUnits);

          if (isFilled) {
            if (shouldWrap) {
              // Fit in document-space units so visual result stays stable across zoom levels.
              const fitted = fitWrappedText({
                text: valueStr,
                fontFamily: resolvedFont.canvasFamily,
                maxWidth: fitMaxWidthDoc,
                maxHeight: fitMaxHeightDoc,
                startSize: field.size ?? 11,
                lineHeightMult: 1.0,
              });
              fontSizeDoc = fitted.fontSize;
              lineHeightDoc = fitted.lineHeight;
              displayLines = fitted.lines || [];
            } else {
              // No wrapping - fit in document-space units.
              const defaultSize = fieldType === "signature" ? 25 : 11;
              const fitted = fitNoWrapText({
                text: valueStr,
                fontFamily: resolvedFont.canvasFamily,
                maxWidth: fitMaxWidthDoc,
                maxHeight: fitMaxHeightDoc,
                startSize: field.size ?? defaultSize,
              });

              fontSizeDoc = fitted.fontSize;
              lineHeightDoc = fontSizeDoc * 1.0;
              displayLines = [fitted.line];
            }
          } else {
            fontSizeDoc = field.size ?? (fieldType === "signature" ? 25 : 11);
            lineHeightDoc = fontSizeDoc * 1.0;
          }

          const fontSize = fontSizeDoc * scale;
          const lineHeight = lineHeightDoc * scale;

          const isSelected =
            selectedFieldId === fieldName ||
            clickedHighlightFieldId === field.id;
          const isContextLabelForField =
            !!contextLabelFieldId &&
            normalizePreviewFieldKey(contextLabelFieldId) ===
              normalizePreviewFieldKey(fieldName);

          const hasFieldError = !!fieldErrors[fieldName];
          const isFieldValid = isFilled && !hasFieldError;
          const isClickable = wetSignatureMode || isOwnedByInitiator;
          const borderColor = isClickable
            ? isFieldValid
              ? "#16a34a"
              : "#dc2626"
            : "#d1d5db";
          const fillColor = isClickable
            ? isFieldValid
              ? "rgba(34, 197, 94, 0.2)"
              : "rgba(239, 68, 68, 0.2)"
            : "transparent";
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
                width: `${Math.max(widthPixels, 4)}px`,
                height: `${Math.max(heightPixels, 4)}px`,
                overflow: "visible",
                display: "flex",
                backgroundColor: fillColor,
                border: isSelected
                  ? `2px solid ${borderColor}`
                  : `1px solid ${borderColor}`,
                zIndex: showOwnerTooltip ? 30 : isSelected ? 20 : 10,
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
              {isContextLabelForField && (
                <div
                  className={`pointer-events-none absolute left-0 -top-9 z-30 transition-all duration-200 ${
                    isContextLabelVisible
                      ? "translate-y-0 opacity-100"
                      : "-translate-y-1 opacity-0"
                  }`}
                >
                  <div className="max-w-[220px] truncate rounded-[0.33em] bg-black px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg">
                    Updating
                  </div>
                  <div className="ml-2 h-0 w-0 border-x-4 border-x-transparent border-t-4 border-t-black" />
                </div>
              )}
              {isFilled && (
                <div
                  className="text-black"
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: `${lineHeight}px`,
                    overflow: "hidden",
                    whiteSpace: shouldWrap ? "pre" : "nowrap",
                    wordWrap: "normal",
                    overflowWrap: "normal",
                    width: "100%",
                    maxWidth: "100%",
                    maxHeight: "100%",
                    padding: "0px",
                    margin: "0px",
                    boxSizing: "border-box",
                    textAlign: align_h === "center" ? "center" : align_h,
                    fontFamily: resolvedFont.cssFamily,
                    fontWeight: resolvedFont.fontWeight,
                    color: "#000000",
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
  <div className="pointer-events-none absolute -top-12 left-0 z-20 max-w-56 rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 shadow-lg">
    <span className="break-words">
      Filled by <strong className="text-slate-900">{ownerLabel}</strong>
    </span>
  </div>
);
