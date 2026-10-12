import {
  BasePdfViewer,
  usePdfDocumentFromUrl,
  usePdfPageRenderer,
} from "@betterinternship/core/pdf-viewer";
import { useAppContext } from "@/lib/ctx-app";
import { Download, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const MIN_SCALE = 0.2;
const MAX_SCALE = 3;
const TOOLBAR_BUTTON_CLASS =
  "cursor-pointer rounded p-1.5 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30";

function PdfPage({
  pdf,
  pageNumber,
  scale,
}: {
  pdf: Parameters<typeof usePdfPageRenderer>[0];
  pageNumber: number;
  scale: number;
}) {
  const { canvasRef } = usePdfPageRenderer(pdf, pageNumber, scale);
  return <canvas ref={canvasRef} className="block bg-white shadow-sm" />;
}

/**
 * Download button for the toolbar. The signed URL lives on the bucket's
 * origin, where `<a download>` is ignored, so this saves the bytes pdf.js
 * already fetched through a same-origin blob URL instead.
 */
function DownloadButton({
  pdf,
  fileName,
}: {
  pdf: Parameters<typeof usePdfPageRenderer>[0];
  fileName: string;
}) {
  const handleDownload = async () => {
    if (!pdf) return;
    const data = await pdf.getData();
    const blobUrl = URL.createObjectURL(
      new Blob([data as BlobPart], { type: "application/pdf" }),
    );
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    link.click();
    // Revoking right away can cancel the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(blobUrl), 40_000);
  };

  return (
    <button
      type="button"
      onClick={() => void handleDownload()}
      className={TOOLBAR_BUTTON_CLASS}
      title="Download"
      aria-label="Download"
    >
      <Download className="h-3.5 w-3.5" />
    </button>
  );
}

/**
 * The shared viewer's toolbar only takes extra controls on its left, so when
 * a download is offered this toolbar replaces it to sit beside the zoom ones.
 */
function PreviewToolbar({
  pdf,
  pageCount,
  visiblePage,
  scale,
  onScaleChange,
  downloadFileName,
}: {
  pdf: Parameters<typeof usePdfPageRenderer>[0];
  pageCount: number;
  visiblePage: number;
  scale: number;
  onScaleChange: (scale: number) => void;
  downloadFileName: string;
}) {
  const zoom = (delta: number) =>
    onScaleChange(
      Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, parseFloat((scale + delta).toFixed(2))),
      ),
    );

  return (
    <div className="flex h-12 flex-shrink-0 items-center justify-end gap-2 border-b border-slate-300 bg-white px-3">
      <span className="text-xs font-medium text-slate-700">
        {visiblePage}/{pageCount || 1}
      </span>
      <div className="ml-1 inline-flex items-center gap-1">
        <button
          type="button"
          onClick={() => zoom(-0.1)}
          disabled={scale <= MIN_SCALE}
          className={TOOLBAR_BUTTON_CLASS}
          title="Zoom out"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => zoom(0.1)}
          disabled={scale >= MAX_SCALE}
          className={TOOLBAR_BUTTON_CLASS}
          title="Zoom in"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
      </div>
      <span className="w-10 text-center text-[11px] font-medium text-slate-700">
        {Math.round(scale * 100)}%
      </span>
      <DownloadButton pdf={pdf} fileName={downloadFileName} />
    </div>
  );
}

export const PDFPreview = ({
  url,
  downloadFileName,
}: {
  url: string;
  /** Shows a download button in the toolbar, saving under this name. */
  downloadFileName?: string;
}) => {
  const { isMobile } = useAppContext();
  const { pdfDoc, pageCount, isLoading, error } = usePdfDocumentFromUrl(url);
  const [scale, setScale] = useState(isMobile ? 0.5 : 0.9);
  const [visiblePage, setVisiblePage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  // Zooming resizes the canvas, which resizes fit-content modals and fires the
  // observer below; without this flag the auto-fit would undo every zoom.
  const hasManualZoomRef = useRef(false);

  const handleScaleChange = (nextScale: number) => {
    hasManualZoomRef.current = true;
    setScale(nextScale);
  };

  useEffect(() => {
    if (!pdfDoc || !containerRef.current) return;

    hasManualZoomRef.current = false;
    let cancelled = false;
    const fitToWidth = async () => {
      try {
        const page = await pdfDoc.getPage(1);
        if (cancelled || hasManualZoomRef.current || !containerRef.current)
          return;

        const pageWidth = page.getViewport({ scale: 1 }).width;
        const availableWidth = containerRef.current.clientWidth - 32;
        const preferredScale = isMobile ? 0.5 : 0.9;
        setScale(
          Math.max(0.2, Math.min(preferredScale, availableWidth / pageWidth)),
        );
      } catch {
        // The document may be destroyed while switching previews.
      }
    };

    void fitToWidth();
    const observer = new ResizeObserver(() => void fitToWidth());
    observer.observe(containerRef.current);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [isMobile, pdfDoc]);

  useEffect(() => {
    setVisiblePage(1);
  }, [url]);

  return (
    <div
      ref={containerRef}
      className="h-[75vh] min-h-[600px] max-h-[800px] w-full min-w-0 overflow-hidden"
    >
      {url ? (
        error ? (
          <div className="flex min-h-48 max-w-[600px] flex-col items-center justify-center gap-3 rounded-sm border border-gray-200 bg-white p-6 text-center">
            <p className="text-sm text-gray-600">{error}</p>
            <a
              className="text-sm text-primary underline"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open document in a new tab
            </a>
          </div>
        ) : isLoading || !pdfDoc ? (
          <div className="flex min-h-48 items-center justify-center text-sm text-gray-500">
            Loading document...
          </div>
        ) : downloadFileName ? (
          <div className="flex h-full flex-col overflow-hidden rounded-[0.33em] bg-slate-50">
            <PreviewToolbar
              pdf={pdfDoc}
              pageCount={pageCount}
              visiblePage={visiblePage}
              scale={scale}
              onScaleChange={handleScaleChange}
              downloadFileName={downloadFileName}
            />
            <div className="min-h-0 flex-1">
              <BasePdfViewer
                pdfDoc={pdfDoc}
                pageCount={pageCount}
                scale={scale}
                onScaleChange={handleScaleChange}
                visiblePage={visiblePage}
                onVisiblePageChange={setVisiblePage}
                showToolbar={false}
                squareFrame
                minScale={MIN_SCALE}
                renderPage={(pageNumber) => (
                  <PdfPage pdf={pdfDoc} pageNumber={pageNumber} scale={scale} />
                )}
              />
            </div>
          </div>
        ) : (
          <BasePdfViewer
            pdfDoc={pdfDoc}
            pageCount={pageCount}
            scale={scale}
            onScaleChange={handleScaleChange}
            visiblePage={visiblePage}
            onVisiblePageChange={setVisiblePage}
            showToolbar
            renderPage={(pageNumber) => (
              <PdfPage pdf={pdfDoc} pageNumber={pageNumber} scale={scale} />
            )}
          />
        )
      ) : (
        <div className="relative flex flex-col items-center bg-white rounded-sm pb-8 w-fit h-fit p-8">
          <div className="text-3xl font-semibold tracking-tight z-10 text-gray-600">
            No resume provided.
          </div>
          <div className="absolute max-w-lg z-0">
            <img
              className="w-full top-0 left-0"
              src="/no-pdf.png"
              alt="No document to load."
            />
          </div>
        </div>
      )}
    </div>
  );
};
