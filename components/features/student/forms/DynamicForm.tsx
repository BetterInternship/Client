"use client";

import { useEffect, useMemo } from "react";
import { z } from "zod";
import { useDynamicFormSchema } from "@/lib/db/use-moa-backend";
import {
  FieldRenderer,
  type FieldDef as RendererFieldDef,
  type FilledBy,
} from "@/components/features/student/forms/FieldRenderer";
import { Loader2 } from "lucide-react";
import type { FieldDef } from "./FormFlowRouter";

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
  onSchema: (defs: FieldDef[]) => void;
  errors?: Record<string, string>;
  showErrors?: boolean;
}) {
  const {
    fields: rawFields,
    error: loadError,
    isLoading,
  } = useDynamicFormSchema(form);

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

  useEffect(() => {
    onSchema(defs);
  }, [defs, onSchema]);

  const Section = ({
    title,
    items,
  }: {
    title: string;
    items: RendererFieldDef[];
  }) => {
    if (!items.length) return null;
    return (
      <div className="space-y-3">
        <div className="pt-2 pb-1">
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        </div>
        {items.map((def) => (
          <div key={def.id}>
            <FieldRenderer
              def={def}
              value={String(values[def.key] ?? "")}
              onChange={(v) => onChange(def.key, v)}
              error={errors[def.key]}
              showError={showErrors}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {isLoading && (
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

      {!isLoading && defs.length > 0 && (
        <>
          <Section
            title="Student Information"
            items={defs.filter((d) => d.section === "student")}
          />
          <Section
            title="University / Internship Information"
            items={defs.filter((d) => d.section === "university")}
          />
        </>
      )}
    </div>
  );
}
