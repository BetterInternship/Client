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
  const profile = useProfileData();
  const [done, setDone] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

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

    if (recipientEmails.length > 0 && !_bypassConfirm) {
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
              <li key={i} className="py-2 text-sm flex gap-1">
                <div className="font-medium text-primary">{e.email}</div>
                <div className=" text-gray-500">- {e.label}</div>
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

  if (done) return <StepComplete onMyForms={() => onGoToMyForms?.()} />;

  // Loader
  if (!form.data?.formMetadata || form.isLoading)
    return <Loader>Loading form...</Loader>;

  return (
    <div className="space-y-4">
      <DynamicForm
        key={formName}
        formName={formName}
        values={values}
        onChange={setField}
        onBlurValidate={validateFieldOnBlur}
        showErrors={submitted}
        errors={errors}
        autofillValues={autofillValues ?? {}}
        setValues={setValues}
        fields={fields}
      />

      <div className="pt-2 flex justify-end gap-2 flex-wrap ">
        <GenerateButtons
          formKey={formName}
          handleSubmit={handleSubmit}
          busy={busy}
          noEsign={!hasSignature}
        />
      </div>
    </div>
  );
}
