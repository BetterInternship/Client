"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useDynamicFormSchema } from "@/lib/db/use-moa-backend";
import { useFormData } from "@/lib/form-data";
import {
  FieldRenderer,
  FieldDef,
} from "@/components/features/student/forms/FieldRenderer";
import { Button } from "@/components/ui/button";

/**
 * The form builder.
 * Changes based on field inputs.
 *
 * @component
 */
export const DynamicForm = ({ form }: { form: string }) => {
  const { fields: rawFields, error: loadError } = useDynamicFormSchema(form);

  const defs: FieldDef[] = useMemo(
    () =>
      (rawFields ?? []).map((f) => ({
        id: f.id,
        key: f.name,
        label: f.label ?? f.name,
        type: f.type, // "text" | "number" | "select" | "date" | "time"
        placeholder: f.placeholder,
        helper: f.helper,
        maxLength: f.max_length,
        options: f.options,
        validators: (f.validators ?? []) as z.ZodTypeAny[],
      })),
    [rawFields],
  );

  // Form data & validation state
  const { formData, setField } = useFormData<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validatorFns, setValidatorFns] = useState<
    Record<string, ((v: any) => string | null)[]>
  >({});
  const [submitted, setSubmitted] = useState(false);

  // Initialize fields and compile validators when defs change
  useEffect(() => {
    if (!defs.length) return;
    for (const d of defs) setField(d.key, "");
    setValidatorFns(compileValidators(defs));
    setErrors({});
    setSubmitted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defs]);

  const handleSubmit = async () => {
    const next = validateAll(defs, formData, validatorFns);
    setErrors(next);
    setSubmitted(true);

    const hasErrors = Object.values(next).some(Boolean);
    if (hasErrors) return;

    console.log("Submitting", formData);
  };

  return (
    <div className="space-y-4">
      {loadError && (
        <p className="text-sm text-red-600">
          Failed to load form: {String(loadError)}
        </p>
      )}

      {defs.map((def) => (
        <div key={def.id}>
          <FieldRenderer
            def={def}
            value={String(formData[def.key] ?? "")}
            onChange={(v) => setField(def.key, v)}
            error={errors[def.key]}
            showError={submitted}
          />
        </div>
      ))}

      <div className="pt-2 flex justify-end">
        <Button onClick={handleSubmit} className="w-full sm:w-auto">
          Submit
        </Button>
      </div>
    </div>
  );
};

/* Helpers */

function compileValidators(defs: FieldDef[]) {
  const map: Record<string, ((v: any) => string | null)[]> = {};
  for (const d of defs) {
    const schemas = (d.validators ?? []) as z.ZodTypeAny[];
    map[d.key] = schemas.map((schema) => (value: any) => {
      const res = schema.safeParse(value);
      if (res.success) return null;
      // Prefer Zod issues; fallback to error message
      const issues = (res.error as any)?.issues as
        | { message: string }[]
        | undefined;
      return issues?.map((i) => i.message).join("\n") ?? res.error.message;
    });
  }
  return map;
}

function validateAll(
  defs: FieldDef[],
  formData: Record<string, any>,
  validatorFns: Record<string, ((v: any) => string | null)[]>,
) {
  const next: Record<string, string> = {};
  for (const d of defs) {
    const fns = validatorFns[d.key] ?? [];
    const val = formData[d.key];
    const firstErr = fns.map((fn) => fn(val)).find(Boolean) ?? "";
    next[d.key] = firstErr || "";
  }
  return next;
}
