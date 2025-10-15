"use client";

import { memo, useMemo } from "react";
import type { z } from "zod";
import {
  FieldRenderer,
  type FieldDef as RendererFieldDef,
} from "@/components/features/student/forms/FieldRenderer";

export type RecipientFieldDef = {
  id: string | number;
  key: string;
  label: string;
  type: string; 
  placeholder?: string;
  helper?: string;
  maxLength?: number;
  options?: Array<{ id: string | number; name: string }>;
  validators?: z.ZodTypeAny[];
  section?: string;
};

export function RecipientDynamicForm({
  formKey,
  fields,
  values,
  onChange,
  errors = {},
  showErrors = false,
  sectionTitleMap,
  emptyHint = "No fields to complete.",
}: {
  formKey: string;
  fields: RecipientFieldDef[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  errors?: Record<string, string>;
  showErrors?: boolean;
  // rename or hide section labels (set value to null to hide header)
  sectionTitleMap?: Record<string, string | null>;
  emptyHint?: string;
}) {
  const grouped = useMemo(() => {
    const by: Record<string, RendererFieldDef[]> = {};
    for (const f of fields) {
      const sec = f.section ?? "details";
      (by[sec] ||= []).push({
        id: f.id,
        key: f.key,
        label: f.label,
        type: f.type as any,
        placeholder: f.placeholder,
        helper: f.helper,
        max_length: f.maxLength,
        options: f.options,
        validators: (f.validators ?? []) as any,
        section: sec as any,
      });
    }
    return by;
  }, [fields]);

  const order = ["guardian", "entity", "student", "university", "details"];
  const orderedKeys = useMemo(() => {
    const keys = Object.keys(grouped);
    const known = order.filter((k) => keys.includes(k));
    const unknown = keys.filter((k) => !order.includes(k)).sort();
    return [...known, ...unknown];
  }, [grouped]);

  if (!fields?.length) {
    return <p className="text-sm text-muted-foreground">{emptyHint}</p>;
  }

  return (
    <div className="space-y-4">
      {orderedKeys.map((sec) => {
        const defs = grouped[sec] ?? [];
        if (!defs.length) return null;
        const title =
          sectionTitleMap &&
          Object.prototype.hasOwnProperty.call(sectionTitleMap, sec)
            ? sectionTitleMap[sec]
            : sec.replace(/\b\w/g, (c) => c.toUpperCase());
        return (
          <Section
            key={sec}
            showTitle={title !== null}
            title={title ?? ""}
            formKey={formKey}
            defs={defs}
            values={values}
            onChange={onChange}
            errors={errors}
            showErrors={showErrors}
          />
        );
      })}
    </div>
  );
}

const Section = memo(function Section({
  showTitle,
  title,
  formKey,
  defs,
  values,
  onChange,
  errors,
  showErrors,
}: {
  showTitle: boolean;
  title: string;
  formKey: string;
  defs: RendererFieldDef[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  errors: Record<string, string>;
  showErrors: boolean;
}) {
  return (
    <div className="space-y-3">
      {showTitle && (
        <div className="pt-2 pb-1">
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        </div>
      )}

      {defs.map((def) => (
        <div key={`${formKey}:${def.section}:${String(def.id)}`}>
          <FieldRenderer
            def={def}
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
