"use client";

import { useEffect, useState } from "react";
import { FormService } from "@/lib/api/services";
import { FormRenderer } from "./FormRenderer";
import { useProfileActions } from "@/lib/api/student.actions.api";
import { StepComplete } from "./StepComplete";
import { useProfileData } from "@/lib/api/student.data.api";
import { useGlobalModal } from "@/components/providers/ModalProvider";
import { Loader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DocumentRenderer } from "./previewer";
import { Loader2 } from "lucide-react";
import { useFormRendererContext } from "./form-renderer.ctx";
import { validateField } from "./utils";
import { useMyAutofill } from "@/hooks/use-my-autofill";

type FormErrors = Record<string, string>;
type FormValues = Record<string, string>;

export function FormFlowRouter({
  formName,
  onGoToMyForms,
}: {
  formName: string;
  onGoToMyForms?: () => void;
}) {
  const form = useFormRendererContext();
  const [done, setDone] = useState(false);
  const [mobileStage, setMobileStage] = useState<
    "preview" | "form" | "confirm"
  >("preview");

  // Form stuff
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<FormErrors>({});

  // Get interface to form
  const formMetdata = form.formMetadata ?? null;
  const fields = formMetdata?.getFieldsForClientService() ?? [];
  const hasSignature = fields.some((field) => field.type === "signature");

  useEffect(() => {
    form.updateFormName(formName);
  }, [formName]);

  // Saved autofill
  const autofillValues = useMyAutofill();

  // Field setter
  const setField = (key: string, v: string | number) => {
    setValues((prev) => ({ ...prev, [key]: v.toString() }));
  };

  // Validate a single field on blur and update errors immediately
  const validateFieldOnBlur = (fieldKey: string) => {
    const field = fields.find((f) => f.field === fieldKey);
    if (!field) return;
    const error = validateField(field, values, autofillValues ?? {});

    if (error) {
      setErrors((prev) => ({
        ...prev,
        [field.field]: error,
      }));
    } else {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field.field];
        return copy;
      });
    }
  };

  if (done)
    return (
      <div className="bg-white p-8 rounded-[0.25em]">
        <StepComplete onMyForms={() => onGoToMyForms?.()} />
      </div>
    );

  // Loader
  if (!form.formMetadata || form.loading)
    return <Loader>Loading form...</Loader>;

  return (
    <div className="relative mx-auto flex h-[100%] max-h-[100%] w-full flex-col items-center overflow-y-hidden bg-opacity-25 max-w-7xl bg-white border border-gray-400 my-7 rounded-[0.33em]">
      <div className="relative flex w-full h-[100%] flex-col justify-center overflow-y-hidden sm:w-7xl sm:flex-row">
        {/* Form Renderer */}
        <div className="relative w-full h-full max-h-full overflow-hidden">
          <div
            className={cn(
              "mb-2 sm:hidden",
              mobileStage === "preview" ? "" : "hidden",
            )}
          >
            <div className="relative w-full overflow-auto rounded-md border mx-auto">
              {form.document.url ? (
                <DocumentRenderer
                  documentUrl={form.document.url}
                  highlights={[]}
                  previews={form.previews}
                  onHighlightFinished={() => {}}
                />
              ) : (
                <div className="p-4 text-sm text-gray-500">
                  No preview available
                </div>
              )}
            </div>

            <div className="mt-2 flex gap-2">
              <Button
                className="w-full"
                onClick={() => setMobileStage("form")}
                disabled={form.loading}
              >
                Fill Form
              </Button>
            </div>
          </div>

          {/* Mobile: confirm preview stage */}
          <div
            className={cn(
              "sm:hidden",
              mobileStage === "confirm" ? "" : "hidden",
            )}
          >
            <div className="relative h-[60vh] w-full overflow-auto rounded-md border bg-white">
              {form.document.url ? (
                <DocumentRenderer
                  documentUrl={form.document.url}
                  highlights={[]}
                  previews={form.previews}
                  onHighlightFinished={() => {}}
                />
              ) : (
                <div className="p-4 text-sm text-gray-500">
                  No preview available
                </div>
              )}
            </div>
          </div>

          {/* loading / error / empty / form */}
          {form.loading ? (
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading form…
              </span>
            </div>
          ) : (
            <FormRenderer
              values={values}
              onChange={setField}
              onBlurValidate={validateFieldOnBlur}
              autofillValues={autofillValues ?? {}}
              setValues={(newValues) =>
                setValues((prev) => ({ ...prev, ...newValues }))
              }
              // ! change this to initiator in the future
              signingPartyId={"party-student"}
              // ! MOVE THIS FUNCTION INSIDE OF THE FORM RENDERER
              hasSignature={hasSignature}
            />
          )}
        </div>

        {/* PDF Renderer - hidden on small screens, visible on sm+ */}
        <div className="relative hidden max-w-[600px] min-w-[600px] overflow-auto sm:block">
          {!form.loading ? (
            <div className="relative flex h-full w-full flex-row gap-2">
              {!!form.document.url && (
                <div className="relative h-full w-full">
                  <DocumentRenderer
                    documentUrl={form.document.url}
                    highlights={[]}
                    previews={form.previews}
                    onHighlightFinished={() => {}}
                  />
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
