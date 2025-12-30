"use client";

import { useFormRendererContext } from "@/components/features/student/forms/form-renderer.ctx";
import { FormAndDocumentLayout } from "@/components/features/student/forms/FormFlowRouter";
import { DocumentRenderer } from "@/components/forms/previewer";
import { useGlobalModal } from "@/components/providers/ModalProvider";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/lib/ctx-app";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * The individual form page.
 * Allows viewing an individual form.
 */
export default function FormPage() {
  const router = useRouter();
  const params = useParams();
  const form = useFormRendererContext();
  const { isMobile } = useAppContext();
  const { open: openGlobalModal } = useGlobalModal();

  const openDocPreviewModal = () => {
    openGlobalModal(
      "doc-preview",
      <div className="h-[95dvh] w-[95dvw] sm:w-[80vw]">
        <DocumentRenderer
          documentUrl={form.document.url}
          highlights={[]}
          previews={form.previews}
          onHighlightFinished={() => {}}
        />
      </div>,
      { title: "Document Preview" },
    );
  };

  useEffect(() => {
    const { name } = params;
    form.updateFormName(name as string);
  }, [params]);

  return (
    <div className="w-full flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto py-4">
          <div className="flex sm:items-center items-start justify-between flex-col sm:flex-row">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            {isMobile && (
              <Button
                variant="ghost"
                onClick={() => {
                  if (isMobile) window.scrollTo({ top: 0, behavior: "smooth" });
                  else openDocPreviewModal();
                }}
                disabled={!form.document.url}
                className="w-full sm:hidden"
              >
                Open Preview
              </Button>
            )}
          </div>
        </div>
      </div>

      <FormAndDocumentLayout formName={form.formName} />
    </div>
  );
}
