"use client";

import { useFormRendererContext } from "@/components/features/student/forms/form-renderer.ctx";
import { FormAndDocumentLayout } from "@/components/features/student/forms/FormFlowRouter";
import { DocumentRenderer } from "@/components/forms/previewer";
import { useGlobalModal } from "@/components/providers/ModalProvider";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/lib/ctx-app";
import { useFormsLayout } from "../layout";
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
  const { setCurrentFormName } = useFormsLayout();

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
    setCurrentFormName(name as string);
    return () => setCurrentFormName(null);
  }, [params, setCurrentFormName]);

  return (
    <div className="w-full flex flex-col h-full overflow-hidden bg-gray-50">
      <FormAndDocumentLayout formName={form.formName} />
    </div>
  );
}
