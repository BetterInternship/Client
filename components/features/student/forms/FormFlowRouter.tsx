"use client";

import { useMemo, useState } from "react";
import { UserService } from "@/lib/api/services";
import { DynamicForm } from "./DynamicForm";
import { useProfileActions } from "@/lib/api/student.actions.api";
import { StepComplete } from "./StepComplete";
import { useProfileData } from "@/lib/api/student.data.api";
import { GenerateButtons } from "./GenerateFormButtons";
import { useGlobalModal } from "@/components/providers/ModalProvider";
import { FormMetadata } from "@betterinternship/core/forms";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "@/components/ui/loader";
import z from "zod";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DocumentRenderer } from "./previewer";
import { ArrowLeft, Info, Loader2 } from "lucide-react";
import { useAppContext } from "@/lib/ctx-app";

type Errors = Record<string, string>;
type FormValues = Record<string, string>;

export function FormFlowRouter({
  formName,
  formVersion,
  onGoToMyForms,
}: {
  formName: string;
  formVersion: number;
  onGoToMyForms?: () => void;
}) {
  const { update } = useProfileActions();
  const { isMobile } = useAppContext();
  const profile = useProfileData();
  const [done, setDone] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [previews, setPreviews] = useState<Record<number, React.ReactNode[]>>(
    {},
  );
  const [mobileStage, setMobileStage] = useState<
    "preview" | "form" | "confirm"
  >("preview");

  // Form stuff
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<Errors>({});

  // recipient confirmation modal state
  const [confirmWithEsign, setConfirmWithEsign] = useState<boolean | undefined>(
    undefined,
  );

  // Fetch form
  const form = useQuery({
    queryKey: ["forms", formName],
    queryFn: () => UserService.getForm(formName),
    enabled: !!formName,
    staleTime: 60_000,
  });

  // Get interface to form
  const formMetdata = form.data?.formMetadata
    ? new FormMetadata(form.data.formMetadata)
    : null;
  const fields = formMetdata?.getFieldsForClient(values) ?? [];
  const hasSignature = fields.some((field) => field.type === "signature");

  // Saved autofill
  const autofillValues = useMemo(() => {
    const internshipMoaFields = profile.data?.internship_moa_fields as Record<
      string,
      Record<string, string>
    >;
    if (!internshipMoaFields) return;

    // Destructure to isolate only shared fields or fields for that form
    const autofillValues = {
      ...(internshipMoaFields.base ?? {}),
      ...internshipMoaFields.shared,
      ...(internshipMoaFields[formName] ?? {}),
    };

    // Populate with prefillers as well
    for (const field of fields) {
      if (field.prefiller) {
        const s = field.prefiller({
          user: profile.data,
        });

        // ! Tentative fix for spaces, move to abstraction later on
        autofillValues[field.field] =
          typeof s === "string" ? s.trim().replace("  ", " ") : s;
      }
    }

    return autofillValues;
  }, [profile.data]);

  // Field setter
  const setField = (key: string, v: string | number) => {
    setValues((prev) => ({ ...prev, [key]: v.toString() }));
  };

  // Validate a single field on blur and update errors immediately
  const validateFieldOnBlur = (fieldKey: string) => {
    const finalValues = { ...autofillValues, ...values };
    const field = fields.find((f) => f.field === fieldKey);
    if (!field) return;

    // Only validate student/manual fields here
    if (field.party !== "student" || field.source !== "manual") return;

    const value = finalValues[field.field];
    const coerced = field.coerce(value);
    const result = field.validator?.safeParse(coerced);
    if (result?.error) {
      const errorString = z
        .treeifyError(result.error)
        .errors.map((e) => e.split(" ").slice(0).join(" "))
        .join("\n");
      setErrors((prev) => ({
        ...prev,
        [field.field]: `${field.label}: ${errorString}`,
      }));
    } else {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field.field];
        return copy;
      });
    }
  };

  /**
   * This submits the form to the server
   * @param withEsign - if true, enables e-sign; if false, does prefill
   * @param _bypassConfirm - internal flag to skip recipient confirmation on re-call
   * @returns
   */
  const handleSubmit = async (withEsign?: boolean, _bypassConfirm = false) => {
    setSubmitted(true);
    if (!profile.data?.id) return;

    // Validate fields before allowing to proceed
    const finalValues = { ...autofillValues, ...values };
    const errors: Record<string, string> = {};
    for (const field of fields) {
      if (field.party !== "student" || field.source !== "manual") continue;

      // Check if missing
      const value = finalValues[field.field];

      // Check validator error
      const coerced = field.coerce(value);
      const result = field.validator?.safeParse(coerced);
      if (result?.error) {
        const errorString = z
          .treeifyError(result.error)
          .errors.map((e) => e.split(" ").slice(0).join(" "))
          .join("\n");
        errors[field.field] = `${field.label}: ${errorString}`;
        continue;
      }
    }

    // If any errors, disallow proceed
    setErrors(errors);
    if (Object.keys(errors).length) return;

    // Find recipient fields (keys ending with ':recipient')
    const recipientEmails = fields
      .filter(
        (f) => typeof f.field === "string" && f.field.endsWith(":recipient"),
      )
      .map((f) => finalValues[f.field]?.trim())
      .filter(Boolean);

    if (recipientEmails.length > 0 && withEsign && !_bypassConfirm) {
      const recipientFields = fields
        .filter(
          (f) => typeof f.field === "string" && f.field.endsWith(":recipient"),
        )
        .map((f) => ({
          field: f.field,
          label: f.label,
          email: finalValues[f.field]?.trim(),
        }))
        .filter((r) => r.email);

      setConfirmWithEsign(withEsign);

      openGlobalModal(
        "confirm-recipients",
        <div>
          <p className="mt-2 text-sm text-gray-600 text-justify">
            We will email the following recipients a separate form to complete
            and sign. Please double-check these addresses before continuing.
          </p>

          <ul className="mt-4 max-h-40 overflow-auto divide-y">
            {recipientFields.map((e, i) => (
              <li
                key={i}
                className="py-2 text-sm flex gap-1 items-center overflow-hidden"
              >
                <div className="font-medium text-primary truncate">
                  {e.email}
                </div>
                <div className="text-gray-500 whitespace-nowrap">
                  - {e.label}
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => closeGlobalModal("confirm-recipients")}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmRecipients} type="button">
              Confirm & Send
            </Button>
          </div>
        </div>,
        { title: "Confirm recipients" },
      );

      return;
    }

    // proceed to save + submit
    try {
      setBusy(true);

      const internshipMoaFieldsToSave: Record<
        string,
        Record<string, string>
      > = {
        shared: {},
      };

      // Save it per field or shared
      for (const field of fields) {
        if (field.shared) {
          internshipMoaFieldsToSave.shared[field.field] =
            finalValues[field.field];
        } else {
          if (!internshipMoaFieldsToSave[formName])
            internshipMoaFieldsToSave[formName] = {};
          internshipMoaFieldsToSave[formName][field.field] =
            finalValues[field.field];
        }
      }

      // Save for future use
      await update.mutateAsync({
        internship_moa_fields: internshipMoaFieldsToSave,
      });

      // Generate form
      await UserService.requestGenerateForm({
        formName,
        formVersion,
        values: finalValues,
        parties: { userId: profile.data.id },
        disableEsign: !withEsign,
      });

      setDone(true);
      setSubmitted(false);
    } catch (e) {
      console.error("Submission error", e);
    } finally {
      setBusy(false);
    }
  };

  const { open: openGlobalModal, close: closeGlobalModal } = useGlobalModal();

  // Called when the user confirms the recipients in the modal
  const handleConfirmRecipients = () => {
    closeGlobalModal("confirm-recipients");
    void handleSubmit(true, true);
  };

  const openDocPreviewModal = () => {
    if (!form.data?.documentUrl) return;
    openGlobalModal(
      "doc-preview",
      <div className="h-[95dvh] w-[95dvw] sm:w-[80vw]">
        <DocumentRenderer
          documentUrl={form.data?.documentUrl}
          highlights={[]}
          previews={previews}
          onHighlightFinished={() => {}}
        />
      </div>,
      { title: "Document Preview" },
    );
  };

  if (done)
    return (
      <div className="bg-white p-8 rounded-[0.25em]">
        <StepComplete onMyForms={() => onGoToMyForms?.()} />
      </div>
    );

  // Loader
  if (!form.data?.formMetadata || form.isLoading)
    return <Loader>Loading form...</Loader>;

  return (
    <div className="relative mx-auto flex h-[100%] max-h-[100%] w-full flex-col items-center overflow-y-hidden px-4 py-8 bg-white bg-opacity-25">
      <div className="max-w-7xl w-full overflow-x-visible overflow-y-visible">
        <div className="flex flex-col bg-white px-6 py-3 border rounded-[0.33em] items-start gap-1 rounded-b-none">
          <Button
            variant="ghost"
            className="relative translate-x-[-1em] text-opacity-65 p-2"
            size="xs"
            onClick={() => closeGlobalModal("form-generator-form")}
          >
            <ArrowLeft className="w-2 h-2 scale-75" />
            Back
          </Button>
          <h1 className="text-primary text-2xl font-bold tracking-tight whitespace-normal sm:whitespace-nowrap ">
            {formName}
          </h1>
        </div>
      </div>
      <div className="relative flex w-full h-[100%] max-w-7xl flex-col justify-center overflow-y-hidden sm:w-7xl sm:flex-row bg-white">
        <div className="relative max-h-[100%] overflow-y-auto w-[100%] bg-white">
          {/* Form Renderer */}
          <div className="h-full max-h-[100%] space-y-4 overflow-y-auto rounded-[0.33em] rounded-t-none rounded-r-none border border-gray-300 p-5 bg-white">
            <div
              className={cn(
                "mb-2 sm:hidden",
                mobileStage === "preview" ? "" : "hidden",
              )}
            >
              <div className="relative w-full overflow-auto rounded-md border">
                {form.data.documentUrl ? (
                  <DocumentRenderer
                    documentUrl={form.data.documentUrl}
                    highlights={[]}
                    previews={previews}
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
                  disabled={form.isLoading}
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
                {form.data.documentUrl ? (
                  <DocumentRenderer
                    documentUrl={form.data.documentUrl}
                    highlights={[]}
                    previews={previews}
                    onHighlightFinished={() => {}}
                  />
                ) : (
                  <div className="p-4 text-sm text-gray-500">
                    No preview available
                  </div>
                )}
              </div>
              <div className="pt-2 flex justify-end gap-2 flex-wrap">
                <GenerateButtons
                  formKey={formName}
                  handleSubmit={handleSubmit}
                  busy={busy}
                  noEsign={!hasSignature}
                />
              </div>
            </div>

            <div
              className={cn(mobileStage === "form" ? "" : "hidden", "sm:block")}
            >
              {/* loading / error / empty / form */}
              {form.isLoading ? (
                <div className="flex items-center justify-center">
                  <span className="inline-flex items-center gap-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading form…
                  </span>
                </div>
              ) : form.error ? (
                <div className="text-sm text-rose-600">
                  Failed to load fields.
                </div>
              ) : fields.length === 0 ? (
                <div className="text-sm text-gray-500">
                  No fields available for this request.
                </div>
              ) : (
                <div className="space-y-4">
                  <DynamicForm
                    fields={fields}
                    values={values}
                    onChange={setField}
                    errors={errors}
                    showErrors={submitted}
                    formName={formName}
                    onBlurValidate={validateFieldOnBlur}
                    autofillValues={autofillValues ?? {}}
                    setValues={(newValues) =>
                      setValues((prev) => ({ ...prev, ...newValues }))
                    }
                    setPreviews={setPreviews}
                    renderFields={formMetdata?.getFieldsForServer() ?? []}
                  />

                  <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
                    <div className="pt-2 flex justify-end gap-2 flex-wrap ">
                      <GenerateButtons
                        formKey={formName}
                        handleSubmit={handleSubmit}
                        busy={busy}
                        noEsign={!hasSignature}
                      />
                    </div>

                    {/* On mobile, also show a secondary preview button */}
                    <Button
                      variant="ghost"
                      onClick={() => {
                        // On mobile while editing, allow quick jump to preview stage
                        if (isMobile) {
                          setMobileStage("preview");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        } else {
                          openDocPreviewModal();
                        }
                      }}
                      disabled={!form.data.documentUrl}
                      className="w-full sm:hidden"
                    >
                      Open Preview
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PDF Renderer - hidden on small screens, visible on sm+ */}
        <div className="relative hidden max-w-[600px] min-w-[600px] overflow-auto sm:block">
          {!form.isLoading ? (
            <div className="relative flex h-full w-full flex-row gap-2">
              {!!form.data.documentUrl && (
                <div className="relative h-full w-full">
                  <DocumentRenderer
                    documentUrl={form.data.documentUrl}
                    highlights={[]}
                    previews={previews}
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
