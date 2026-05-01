import { useClientDimensions } from "@/hooks/use-dimensions";
import { useAppContext } from "@/lib/ctx-app";
import { FileWarning } from "lucide-react";

export const PDFPreview = ({ url }: { url: string }) => {
  const { isMobile } = useAppContext();
  const { clientWidth, clientHeight } = useClientDimensions();

  return (
    <div className="px-6 pb-6">
      {url ? (
        <iframe
          allowTransparency={true}
          className="w-full h-screen border border-gray-200 rounded-sm"
          style={{
            width: isMobile
              ? Math.min(clientWidth * 0.9, 600)
              : Math.min(clientWidth * 0.5, 600),
            height: clientHeight * 0.75,
            minHeight: "600px",
            maxHeight: "800px",
            background: "#FFFFFF",
          }}
          src={url + "#toolbar=0&navpanes=0&scrollbar=1"}
        >
          File could not be loaded.
        </iframe>
      ) : (
        <div className="relative flex flex-col items-center bg-white border border-gray-200 rounded-sm pb-8 w-fit h-fit p-8">
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
