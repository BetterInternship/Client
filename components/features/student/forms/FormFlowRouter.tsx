"use client";

import { useMemo, useState } from "react";
import { UserService } from "@/lib/api/services";
import { DynamicForm } from "./DynamicForm";
import { useProfileActions } from "@/lib/api/student.actions.api";
import { StepComplete } from "./StepComplete";
import { useProfileData } from "@/lib/api/student.data.api";
import { GenerateButtons } from "./GenerateFormButtons";
import { FormMetadata } from "@betterinternship/core/forms";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "@/components/ui/loader";
import z from "zod";

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
  const fields = formMetdata?.getFieldsForClient() ?? [];

  // Saved autofill
  const autofillValues = useMemo(() => {
    const autofillValues = profile.data?.internship_moa_fields as Record<
      string,
      string
    >;
    if (!autofillValues) return;

    // Populate with prefillers as well
    for (const field of fields) {
      if (field.prefiller)
        autofillValues[field.field] = field
          .prefiller({
            user: profile.data,
          })
          .trim()
          .replace("  ", " ");
    }

    return autofillValues;
  }, [profile.data]);

  // Field setter
  const setField = (key: string, v: string | number) => {
    setValues((prev) => ({ ...prev, [key]: v.toString() }));
  };

  const handleSubmit = async (withEsign?: boolean) => {
    setSubmitted(true);
    if (!profile.data?.id) return;

    // Validate fields before allowing to proceed
    const errors: Record<string, string> = {};
    for (const field of fields) {
      if (field.source !== "student") continue;

      // Check if missing
      const value = values[field.field];
      if (!value) {
        errors[field.field] = `${field.label} is missing.`;
        continue;
      }

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

    try {
      setBusy(true);

      await update.mutateAsync({
        internship_moa_fields: { ...autofillValues, ...values },
      });

      const route = withEsign ? "submitSignedForm" : "submitPendingForm";
      await UserService[route]({
        formName,
        formVersion,
        values,
        parties: { userId: profile.data.id },
      });

      setDone(true);
      setSubmitted(false);
    } catch (e) {
      console.error("Submission error", e);
    } finally {
      setBusy(false);
    }
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
        />
      </div>
    </div>
  );
}
