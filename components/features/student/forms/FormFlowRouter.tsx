"use client";

import { useCallback, useState, useEffect } from "react";
import { UserService } from "@/lib/api/services";
import { DynamicForm } from "./DynamicForm";
import { useProfileActions } from "@/lib/api/student.actions.api";
import { StepComplete } from "./StepComplete";
import { useProfileData } from "@/lib/api/student.data.api";
import { GenerateButtons } from "./GenerateFormButtons";
import { ClientField } from "@betterinternship/core/forms";
import { coerceAnyDate } from "@/lib/utils";

type Errors = Record<string, string>;
type FormValues = Record<string, unknown>;

export function FormFlowRouter({
  formName,
  onGoToMyForms,
}: {
  formName: string;
  onGoToMyForms?: () => void;
}) {
  const { update } = useProfileActions();
  const { data: profileData } = useProfileData();
  const [done, setDone] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [selection, setSelection] = useState<string>("");

  // Form stuff
  const [fields, setFields] = useState<ClientField<[]>[]>([]);
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<Errors>({});

  // saved autofill
  const autofillValues =
    (profileData?.internship_moa_fields as
      | Record<string, string>
      | undefined) ?? undefined;
  console.log("Saved autofill:", autofillValues);

  // seed from saved
  useEffect(() => {
    if (!autofillValues || !fields.length) return;
    setValues((prev) => {
      const next = { ...prev };

      for (const field of fields) {
        const autofillValue = autofillValues[field.field];
        if (
          autofillValue !== undefined &&
          isEmptyFor(field, prev[field.field])
        ) {
          const coerced = coerceForField(field, autofillValue);
          if (coerced !== undefined) {
            next[field.field] = coerced;
          }
        }
      }
      return next;
    });
  }, [fields, autofillValues]);

  const setField = useCallback((key: string, v: unknown) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    if (key === "entity-id") {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      const id = typeof v === "string" ? v : v == null ? "" : String(v);
      setSelection(id);
    }
  }, []);

  const validateNow = useCallback(() => {
    // ! validate using the validators of the fields!!!!
    // ? this should return a new values object, with validated values.
    // ? otherwise, errors should be populated accordingly
  }, [fields, values]);

  const handleSubmit = useCallback(
    async (withEsign?: boolean) => {
      setSubmitted(true);
      if (!profileData?.id) return;

      const next = validateNow();
      const baseFromAutofill: Record<string, string> = {
        ...(autofillValues ?? {}),
      };

      // all current form fields
      const fromFormNow: Record<string, string> = {};
      for (const field of fields) {
        const v = values[field.field];
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        let s = v == null ? "" : String(v);
        if (s === "undefined") s = "";
        fromFormNow[field.field] = s;
      }

      const finalFlat: Record<string, string> = {
        ...baseFromAutofill,
        ...fromFormNow,
      };

      if (finalFlat["entity-id"] === "undefined") {
        finalFlat["entity-id"] = "";
      }

      console.log("🧾 Submitting flat payload:", finalFlat);

      try {
        setBusy(true);

        await update.mutateAsync({ internship_moa_fields: finalFlat });

        const route = withEsign ? "submitSignedForm" : "submitPendingForm";
        await UserService[route]({
          formName,
          values: finalFlat,
        });

        setDone(true);
        setSubmitted(false);
      } catch (e) {
        console.error("Submission error", e);
      } finally {
        setBusy(false);
      }
    },
    [
      fields,
      values,
      validateNow,
      update,
      profileData?.id,
      formName,
      selection,
      autofillValues,
    ],
  );

  if (done) return <StepComplete onMyForms={() => onGoToMyForms?.()} />;

  return (
    <div className="space-y-4">
      <DynamicForm
        key={formName}
        form={formName}
        values={values}
        onChange={setField}
        showErrors={submitted}
        errors={errors}
      />

      <div className="pt-2 flex justify-end gap-2 flex-wrap ">
        <GenerateButtons
          formKey={formName}
          handleSubmit={handleSubmit}
          busy={busy}
        />
      </div>
    </div>
  );
}

/**
 * Checks if field is empty, based on field type.
 *
 * @param field
 * @param value
 * @returns
 */
function isEmptyFor(field: ClientField<[]>, value: unknown) {
  switch (field.type) {
    case "date":
      return !(typeof value === "number" && value > 0); // 0/undefined = empty
    case "signature":
      return value !== true;
    case "number":
      return value === undefined || value === "";
    default:
      return value === undefined || value === "";
  }
}

/**
 * Coerces the value into the type needed by the field.
 * Useful, used outside zod schemas.
 *
 * @param field
 * @param value
 * @returns
 */
const coerceForField = (field: ClientField<[]>, value: unknown) => {
  switch (field.type) {
    case "number":
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      return value == null ? "" : String(value);
    case "date":
      return coerceAnyDate(value);
    case "time":
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      return value == null ? "" : String(value);
    case "signature":
      return value === true;
    case "text":
    default:
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      return value == null ? "" : String(value);
  }
};
