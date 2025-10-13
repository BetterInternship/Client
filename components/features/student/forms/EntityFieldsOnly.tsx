"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useDynamicFormSchema } from "@/lib/db/use-moa-backend";
import { useFormData } from "@/lib/form-data";
import { FieldRenderer, type FieldDef, type FilledBy } from "./FieldRenderer";
import { Loader2 } from "lucide-react";

/** Renders only fields that belong to the employer side. */
export function EntityFieldsOnly({ form }: { form: string }) {
  const { fields: rawFields, isLoading, error } = useDynamicFormSchema(form);

  const defs: FieldDef[] = useMemo(
    () =>
      (rawFields ?? []).map((f) => ({
        id: f.id,
        key: f.name,
        label: f.label ?? f.name,
        type: f.type,
        placeholder: f.placeholder,
        helper: f.helper,
        maxLength: f.max_length,
        options: f.options,
        validators: (f.validators ?? []) as z.ZodTypeAny[],
        section: f.section as FilledBy,
      })),
    [rawFields],
  );

  // keep only "entity" fields (by section or label/key prefix)
  const entityDefs = useMemo(
    () => defs.filter((d) => d.section === "entity"),
    [defs],
  );

  // local form state (same pattern as DynamicForm)
  const { formData, setField } = useFormData<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!entityDefs.length) return;
    for (const d of entityDefs) setField(d.key, "");
    setErrors({});
    setSubmitted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityDefs]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading employer fields…</span>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-rose-600">Failed to load employer fields.</p>
    );
  }

  if (entityDefs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No employer fields in this form.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {entityDefs.map((def) => (
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
    </div>
  );
}
