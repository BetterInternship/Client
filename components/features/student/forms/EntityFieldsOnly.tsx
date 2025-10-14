"use client";

import { useEffect, useMemo } from "react";
import { z } from "zod";
import { useDynamicFormSchema } from "@/lib/db/use-moa-backend";
import {
  FieldRenderer,
  type FieldDef as RendererFieldDef,
  type FilledBy,
} from "./fieldRenderer";
import { Loader2 } from "lucide-react";
import type { FieldDef } from "./FormFlowRouter";

/** Renders only fields that belong to the employer side. */
export function EntityFieldsOnly({
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
        validators: f.validators ?? [],
        section: f.section as FilledBy,
      })),
    [rawFields],
  );

  useEffect(() => {
    onSchema(defs.filter((d) => d.section === "entity"));
  }, [defs, onSchema]);

  const entityDefs: RendererFieldDef[] = useMemo(
    () => defs.filter((d) => d.section === "entity"),
    [defs],
  );

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
            value={String(values[def.key] ?? "")}
            onChange={(v) => onChange(def.key, v)}
            error={errors[def.key]}
            showError={showErrors}
          />
        </div>
      ))}
    </div>
  );
}
