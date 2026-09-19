import {
  BasePdfViewer,
  usePdfDocumentFromUrl,
  usePdfPageRenderer,
} from "@betterinternship/core/pdf-viewer";
import { useAppContext } from "@/lib/ctx-app";
import { useEffect, useState } from "react";

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

export const PDFPreview = ({ url }: { url: string }) => {
  const { isMobile } = useAppContext();
  const { pdfDoc, pageCount, isLoading, error } = usePdfDocumentFromUrl(url);
  const [scale, setScale] = useState(isMobile ? 0.5 : 0.9);
  const [visiblePage, setVisiblePage] = useState(1);

  useEffect(() => {
    setScale(isMobile ? 0.5 : 0.9);
  }, [isMobile]);

  useEffect(() => {
    setVisiblePage(1);
  }, [url]);

  return (
    <div className="h-[75vh] min-h-[600px] max-h-[800px] px-6 pb-6">
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
        ) : (
          <BasePdfViewer
            pdfDoc={pdfDoc}
            pageCount={pageCount}
            scale={scale}
            onScaleChange={setScale}
            visiblePage={visiblePage}
            onVisiblePageChange={setVisiblePage}
            showToolbar={false}
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
