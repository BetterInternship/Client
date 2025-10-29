"use client";

import { useMemo, useState } from "react";
import { UserService } from "@/lib/api/services";
import { DynamicForm } from "./DynamicForm";
import { useProfileActions } from "@/lib/api/student.actions.api";
import { StepComplete } from "./StepComplete";
import { useProfileData } from "@/lib/api/student.data.api";
import { GenerateButtons } from "./GenerateFormButtons";
import { ClientField } from "@betterinternship/core/forms";

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
  const [fields, setFields] = useState<ClientField<[]>[]>([]);
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<Errors>({});

  // Saved autofill
  const autofillValues = useMemo(
    () =>
      (profile.data?.internship_moa_fields as
        | Record<string, string>
        | undefined) ?? undefined,
    [profile.data],
  );

  // Field setter
  const setField = (key: string, v: string | number) => {
    setValues((prev) => ({ ...prev, [key]: v.toString() }));
  };

  const handleSubmit = async (withEsign?: boolean) => {
    setSubmitted(true);
    if (!profile.data?.id) return;

    console.log("🧾 Submitting flat payload:", values);

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

  return (
    <div className="space-y-4">
      <DynamicForm
        key={formName}
        form={formName}
        values={values}
        onChange={setField}
        showErrors={submitted}
        errors={errors}
        autofillValues={autofillValues ?? {}}
        setValues={setValues}
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
