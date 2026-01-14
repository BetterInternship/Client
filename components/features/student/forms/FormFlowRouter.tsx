"use client";

import { useEffect, useState, useMemo } from "react";
import { FormFillerRenderer } from "./FormFillerRenderer";
import { Loader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormPreviewPdfDisplay } from "./previewer";
import { Loader2, ChevronLeft } from "lucide-react";
import { useFormRendererContext } from "./form-renderer.ctx";
import { useFormFiller } from "./form-filler.ctx";
import { useMyAutofill } from "@/hooks/use-my-autofill";
import { getBlockField, isBlockField } from "./utils";
import { FormActionButtons } from "./FormActionButtons";
import { toast } from "sonner";
import { toastPresets } from "@/components/ui/sonner-toast";

export function FormAndDocumentLayout({ formName }: { formName: string }) {
  const form = useFormRendererContext();
  const formFiller = useFormFiller();
  const autofillValues = useMyAutofill();
  const [mobileStage, setMobileStage] = useState<"preview" | "form" | "sign">(
    "preview",
  );
  const [values, setValues] = useState<Record<string, string>>({});

  // Filter blocks to only include manual source fields (same as FormFillerRenderer)
  const manualBlocks = useMemo(
    () =>
      form.blocks.filter(
        (block) =>
          isBlockField(block) && getBlockField(block)?.source === "manual",
      ),
    [form.blocks],
  );

  // Get keyedFields that correspond to manual blocks (for PDF preview with coordinates)
  const manualKeyedFields = useMemo(() => {
    if (!form.keyedFields || form.keyedFields.length === 0) return [];

    // Get field names from manual blocks
    const manualFieldNames = new Set(
      manualBlocks.map((block) => getBlockField(block)?.field).filter(Boolean),
    );

    // Filter keyedFields to only those in manual blocks
    return form.keyedFields.filter((kf) => manualFieldNames.has(kf.field));
  }, [form.keyedFields, manualBlocks]);

  useEffect(() => {
    form.updateFormName(formName);
  }, [formName]);

  // Loader
  if (!form.formMetadata || form.loading)
    return <Loader>Loading form...</Loader>;

  return (
    <div className="relative mx-auto flex h-full w-full flex-col items-center overflow-hidden bg-opacity-25 max-w-7xl bg-white border border-gray-200 rounded-[0.33em]">
      {/* ============ MOBILE LAYOUT ============ */}
      <div className="sm:hidden w-full h-full flex flex-col overflow-hidden">
        {/* Mobile: Preview Stage - Show PDF */}
        {mobileStage === "preview" && (
          <div className="w-full h-full flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto">
              {form.document.url ? (
                <FormPreviewPdfDisplay
                  documentUrl={form.document.url}
                  blocks={manualKeyedFields}
                  values={values}
                  onFieldClick={(fieldName) =>
                    form.setSelectedPreviewId(fieldName)
                  }
                  selectedFieldId={form.selectedPreviewId}
                  scale={0.7}
                />
              ) : (
                <div className="p-4 text-sm text-gray-500">
                  No preview available
                </div>
              )}
            </div>

            <div className="border-t bg-white p-4">
              <Button
                className="w-full h-10"
                onClick={() => setMobileStage("form")}
                disabled={form.loading}
              >
                Start Filling
              </Button>
            </div>
          </div>
        )}

        {/* Mobile: Form Stage - Show Form Only */}
        {mobileStage === "form" && (
          <div className="w-full h-full flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto">
              {form.loading ? (
                <div className="flex items-center justify-center h-full">
                  <span className="inline-flex items-center gap-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading form…
                  </span>
                </div>
              ) : (
                <FormFillerRenderer onValuesChange={setValues} />
              )}
            </div>

            <div className="border-t bg-white p-4 flex gap-2">
              <Button
                variant="ghost"
                className="flex-1 h-10"
                onClick={() => setMobileStage("preview")}
              >
                Back
              </Button>
              <Button
                className="flex-1 h-10"
                onClick={() => {
                  // Validate fields before proceeding
                  const errors = formFiller.validate(
                    form.fields,
                    autofillValues,
                  );
                  if (Object.keys(errors).length > 0) {
                    toast.error(
                      "There are missing fields",
                      toastPresets.destructive,
                    );
                    return;
                  }
                  setMobileStage("sign");
                }}
              >
                Review
              </Button>
            </div>
          </div>
        )}

        {/* Mobile: Sign Stage - Show PDF with Signing Options */}
        {mobileStage === "sign" && (
          <div className="w-full h-full flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto">
              {form.document.url ? (
                <FormPreviewPdfDisplay
                  documentUrl={form.document.url}
                  blocks={manualKeyedFields}
                  values={values}
                  onFieldClick={(fieldName) =>
                    form.setSelectedPreviewId(fieldName)
                  }
                  selectedFieldId={form.selectedPreviewId}
                  scale={0.7}
                />
              ) : (
                <div className="p-4 text-sm text-gray-500">
                  No preview available
                </div>
              )}
            </div>

            <div className="border-t bg-white p-4 flex gap-2 items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 flex-shrink-0"
                onClick={() => setMobileStage("form")}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <FormActionButtons />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============ DESKTOP LAYOUT ============ */}
      <div className="hidden sm:flex relative w-full h-full flex-row overflow-hidden gap-0">
        {/* Desktop: Form on Left */}
        <div className="relative flex-1 overflow-auto">
          {form.loading ? (
            <div className="flex items-center justify-center h-full">
              <span className="inline-flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading form…
              </span>
            </div>
          ) : (
            <FormFillerRenderer onValuesChange={setValues} />
          )}
        </div>

        {/* Desktop: PDF Preview on Right */}
        <div className="relative max-w-[600px] min-w-[600px] overflow-auto border-l">
          {!form.loading && form.document.url ? (
            <div className="relative h-full w-full">
              <FormPreviewPdfDisplay
                documentUrl={form.document.url}
                blocks={manualKeyedFields}
                values={values}
                onFieldClick={(fieldName) =>
                  form.setSelectedPreviewId(fieldName)
                }
                selectedFieldId={form.selectedPreviewId}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
