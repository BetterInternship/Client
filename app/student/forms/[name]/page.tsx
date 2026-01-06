"use client";

import { useFormRendererContext } from "@/components/features/student/forms/form-renderer.ctx";
import { FormAndDocumentLayout } from "@/components/features/student/forms/FormFlowRouter";
import { useFormsLayout } from "../layout";
import { useParams } from "next/navigation";
import { useEffect } from "react";

/**
 * The individual form page.
 * Allows viewing an individual form.
 */
export default function FormPage() {
  const params = useParams();
  const form = useFormRendererContext();
  const { setCurrentFormName } = useFormsLayout();

  useEffect(() => {
    const { name } = params;
    form.updateFormName(name as string);
    setCurrentFormName(name as string);

    return () => setCurrentFormName(null);
  }, [params, setCurrentFormName]);

  // Warn user before unloading the page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return (
    <div className="w-full flex flex-col h-full overflow-hidden bg-gray-50">
      <FormAndDocumentLayout formName={form.formName} />
    </div>
  );
}
