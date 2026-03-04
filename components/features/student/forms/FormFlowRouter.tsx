"use client";

import { useEffect, useState, useMemo } from "react";
import { FormFillerRenderer } from "./FormFillerRenderer";
import { Loader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { FormPreviewPdfDisplay } from "./previewer";
import { Loader2, ChevronLeft } from "lucide-react";
import { useFormRendererContext } from "./form-renderer.ctx";
import { useFormFiller } from "./form-filler.ctx";
import { useMyAutofill } from "@/hooks/use-my-autofill";
import { FormActionButtons } from "./FormActionButtons";
import { toast } from "sonner";
import { toastPresets } from "@/components/ui/sonner-toast";
import { type PreviewField } from "@/lib/form-previewer-model";

export function FormAndDocumentLayout({ formName }: { formName: string }) {
  const form = useFormRendererContext();
  const formFiller = useFormFiller();
  const autofillValues = useMyAutofill();
  const [mobileStage, setMobileStage] = useState<"preview" | "form" | "sign">(
    "preview",
  );
  const [values, setValues] = useState<Record<string, string>>({});
  const [selectedFieldSource, setSelectedFieldSource] = useState<
    "form" | "pdf" | null
  >(null);
  const [selectionTick, setSelectionTick] = useState(0);
  const signingParties = useMemo(
    () => form.formMetadata.getSigningParties(),
    [form.formMetadata, form.formName],
  );

  const fieldMetaByName = useMemo(() => {
    const metaMap = new Map<
      string,
      { signing_party_id?: string; source?: string; prefiller?: unknown }
    >();
    const allBlocks = form.formMetadata.getBlocksForEditorService();
    allBlocks.forEach((block) => {
      const schema = block.field_schema ?? block.phantom_field_schema;
      const fieldName = schema?.field;
      if (!fieldName || metaMap.has(fieldName)) return;
      metaMap.set(fieldName, {
        signing_party_id: block.signing_party_id,
        source: schema?.source,
        prefiller: schema?.prefiller,
      });
    });
    return metaMap;
  }, [form.formMetadata, form.formName]);

  // Use all keyed fields in PDF preview so non-initiator fields can appear as gray boxes.
  const previewKeyedFields = useMemo<PreviewField[]>(
    () =>
      (form.keyedFields ?? []).map((field) => {
        const normalizedFieldName = String(field.field ?? "").replace(
          /:default$/i,
          "",
        );
        const meta =
          fieldMetaByName.get(field.field) ??
          fieldMetaByName.get(`${normalizedFieldName}:default`) ??
          fieldMetaByName.get(normalizedFieldName);

        return {
          id: field._id,
          field: field.field,
          label: field.field,
          page: field.page,
          x: field.x,
          y: field.y,
          w: field.w,
          h: field.h,
          size: field.size,
          wrap: field.wrap,
          align_h: field.align_h,
          align_v: field.align_v,
          font: field.font,
          type: field.type,
          signing_party_id: meta?.signing_party_id,
          source: meta?.source,
          prefiller: meta?.prefiller,
        };
      }),
    [form.keyedFields, fieldMetaByName],
  );

  useEffect(() => {
    form.updateFormName(formName);
  }, [formName]);

  const handlePdfFieldSelect = (fieldName: string) => {
    setSelectedFieldSource("pdf");
    setSelectionTick((prev) => prev + 1);
    form.setSelectedPreviewId(fieldName);
  };

  const handleFormFieldSelect = (fieldName: string) => {
    setSelectedFieldSource("form");
    setSelectionTick((prev) => prev + 1);
    form.setSelectedPreviewId(fieldName);
  };

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
                  blocks={previewKeyedFields}
                  values={values}
                  fieldErrors={formFiller.errors}
                  selectionTick={selectionTick}
                  autoScrollToSelectedField={selectedFieldSource === "form"}
                  signingParties={signingParties}
                  onFieldClick={handlePdfFieldSelect}
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
                <FormFillerRenderer
                  onValuesChange={setValues}
                  selectionTick={selectionTick}
                  autoScrollToSelectedField={selectedFieldSource === "pdf"}
                  onFieldSelect={handleFormFieldSelect}
                />
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
                  blocks={previewKeyedFields}
                  values={values}
                  fieldErrors={formFiller.errors}
                  selectionTick={selectionTick}
                  autoScrollToSelectedField={selectedFieldSource === "form"}
                  signingParties={signingParties}
                  onFieldClick={handlePdfFieldSelect}
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
            <FormFillerRenderer
              onValuesChange={setValues}
              selectionTick={selectionTick}
              autoScrollToSelectedField={selectedFieldSource === "pdf"}
              onFieldSelect={handleFormFieldSelect}
            />
          )}
        </div>

        {/* Desktop: PDF Preview on Right */}
        <div className="relative max-w-[600px] min-w-[600px] overflow-auto border-l">
          {!form.loading && form.document.url ? (
            <div className="relative h-full w-full">
              <FormPreviewPdfDisplay
                documentUrl={form.document.url}
                blocks={previewKeyedFields}
                values={values}
                fieldErrors={formFiller.errors}
                selectionTick={selectionTick}
                autoScrollToSelectedField={selectedFieldSource === "form"}
                signingParties={signingParties}
                onFieldClick={handlePdfFieldSelect}
                selectedFieldId={form.selectedPreviewId}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
