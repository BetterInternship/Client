"use client";

import { useEffect, useMemo, useRef, useState, memo } from "react";
import { useDynamicFormSchema } from "@/lib/db/use-moa-backend";
import {
  FieldRenderer,
  type FieldDef as RendererFieldDef,
  type Section,
} from "@/components/features/student/forms/FieldRenderer";
import { Loader2 } from "lucide-react";

/**
 * The form builder.
 * Changes based on field inputs.
 *
 * @component
 */
export function DynamicForm({
  form,
  values,
  onChange,
  onSchema,
  errors = {},
  showErrors = false,
}: {
  form: string;
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onSchema: (defs: RendererFieldDef[]) => void;
  errors?: Record<string, string>;
  showErrors?: boolean;
}) {
  const {
    fields: rawFields,
    error: loadError,
    isLoading,
  } = useDynamicFormSchema(form);

  const defs: RendererFieldDef[] = useMemo(
    () =>
      (rawFields ?? []).map((f) => ({
        id: f.id,
        key: f.name,
        value: f?.value ?? undefined,
        label: f.label ?? f.name,
        type: f.type ?? "text",
        helper: f.helper ?? undefined,
        validators: f.validators ?? [],
        section: f.section as Section,
        options: f.options as { value: string; label: string }[],
      })),
    [rawFields],
  );

  const lastSigRef = useRef("");
  useEffect(() => {
    const sig = JSON.stringify(
      defs.map((d) => [d.section, String(d.id), d.key, d.type]),
    );
    if (sig !== lastSigRef.current) {
      lastSigRef.current = sig;
      onSchema(defs);
    }
  }, [defs, onSchema]);

  const [bootstrapped, setBootstrapped] = useState(false);
  useEffect(() => {
    if (!bootstrapped && defs.length > 0) setBootstrapped(true);
  }, [bootstrapped, defs.length]);

  const companyDefs: RendererFieldDef[] = useMemo(
    () => defs.filter((d) => d.section === "entity"),
    [defs],
  );
  const studentDefs: RendererFieldDef[] = useMemo(
    () => defs.filter((d) => d.section === "student"),
    [defs],
  );
  const internshipDefs: RendererFieldDef[] = useMemo(
    () => defs.filter((d) => d.section === "internship"),
    [defs],
  );
  const universityDefs: RendererFieldDef[] = useMemo(
    () => defs.filter((d) => d.section === "university"),
    [defs],
  );

  const showInitialLoader = isLoading && !bootstrapped;

  return (
    <div className="space-y-4" aria-busy={isLoading}>
      {showInitialLoader && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading form…</span>
        </div>
      )}

      {loadError && (
        <p className="text-sm text-red-600">
          Failed to load form:{" "}
          {loadError instanceof Error
            ? loadError.message
            : JSON.stringify(loadError)}
        </p>
      )}

      {bootstrapped && (
        <>
          <FormSection
            formKey={form}
            title="Company Information"
            defs={companyDefs}
            values={values}
            onChange={onChange}
            errors={errors}
            showErrors={showErrors}
          />

          <FormSection
            formKey={form}
            title="Student Information"
            defs={studentDefs}
            values={values}
            onChange={onChange}
            errors={errors}
            showErrors={showErrors}
          />

          <FormSection
            formKey={form}
            title="Internship Information"
            defs={internshipDefs}
            values={values}
            onChange={onChange}
            errors={errors}
            showErrors={showErrors}
          />

          <FormSection
            formKey={form}
            title="University Information"
            defs={universityDefs}
            values={values}
            onChange={onChange}
            errors={errors}
            showErrors={showErrors}
          />
        </>
      )}
    </div>
  );
}

const FormSection = memo(function FormSection({
  formKey,
  title,
  defs,
  values,
  onChange,
  errors,
  showErrors,
}: {
  formKey: string;
  title: string;
  defs: RendererFieldDef[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  errors: Record<string, string>;
  showErrors: boolean;
}) {
  if (!defs.length) return null;

  return (
    <div className="space-y-3">
      <div className="pt-2 pb-1">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>

      {defs.map((def) => (
        <div key={`${formKey}:${def.section}:${String(def.id)}`}>
          <FieldRenderer
            def={def}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value={values[def.key]}
            onChange={(v) => onChange(def.key, v)}
            error={errors[def.key]}
            showError={showErrors}
          />
        </div>
      ))}
    </div>
  );
});
