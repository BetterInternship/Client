"use client";

import { useFormRendererContext } from "@/components/features/student/forms/form-renderer.ctx";
import { FormAndDocumentLayout } from "@/components/features/student/forms/FormFlowRouter";
import { useFormsLayout } from "../layout";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

/**
 * The individual form page.
 * Allows viewing an individual form.
 */
export default function FormPage() {
  const params = useParams();
  const form = useFormRendererContext();
  const { setCurrentFormName, setCurrentFormLabel } = useFormsLayout();

  // Show mobile notice toast on mount
  useEffect(() => {
    const isMobile = window.innerWidth < 640; // sm breakpoint
    if (isMobile) {
      toast(
        "Our desktop experience might currently be preferable, so let us know if you have insights about how we can make mobile better! Chat us on Facebook or email us at hello@betterinternship.com if you go through any issues.",
        {
          duration: 6000,
          className: "text-justify",
        },
      );
    }
  }, []);

  useEffect(() => {
    const { name } = params;
    form.updateFormName(name as string);
    setCurrentFormName(name as string);

    return () => setCurrentFormName(null);
  }, [params, setCurrentFormName, form]);

  useEffect(() => {
    setCurrentFormLabel(form.formLabel);
  }, [form.formLabel, setCurrentFormLabel]);

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
