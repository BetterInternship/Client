import { FormFillPdfViewer } from "@betterinternship/core/pdf-viewer";
import { useAppContext } from "@/lib/ctx-app";
import { useEffect, useState } from "react";

export const PDFPreview = ({ url }: { url: string }) => {
  const { isMobile } = useAppContext();
  const [documentUrl, setDocumentUrl] = useState("");
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!url) return;

    const controller = new AbortController();
    let objectUrl: string | undefined;

    const loadPdf = async () => {
      setDocumentUrl("");
      setLoadError(false);

      try {
        const response = await fetch(url, {
          credentials: "include",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Could not load resume");

        const blob = await response.blob();
        if (controller.signal.aborted) return;

        objectUrl = URL.createObjectURL(blob);
        setDocumentUrl(objectUrl);
      } catch {
        if (!controller.signal.aborted) setLoadError(true);
      }
    };

    void loadPdf();

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  return (
    <div className="px-6 pb-6 min-h-[600px]">
      {url ? (
        documentUrl ? (
          <FormFillPdfViewer
            documentUrl={documentUrl}
            blocks={[]}
            values={{}}
            scale={isMobile ? 0.5 : 0.9}
            showToolbar={false}
          />
        ) : loadError ? (
          <div className="flex min-h-48 max-w-[600px] flex-col items-center justify-center gap-3 rounded-sm border border-gray-200 bg-white p-6 text-center">
            <p className="text-sm text-gray-600">Could not load the resume.</p>
            <a
              className="text-sm text-primary underline"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open resume in a new tab
            </a>
          </div>
        ) : (
          <div className="flex min-h-48 items-center justify-center text-sm text-gray-500">
            Loading resume...
          </div>
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
