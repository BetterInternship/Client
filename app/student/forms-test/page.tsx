"use client";

import { useEffect, useMemo, useState } from "react";
import { OutsideTabPanel, OutsideTabs } from "@/components/ui/outside-tabs";
import { HeaderIcon, HeaderText } from "@/components/ui/text";
import { Newspaper } from "lucide-react";
import { z } from "zod";
import { useDynamicFormSchema } from "@/lib/db/use-moa-backend";
import { useFormData } from "@/lib/form-data";
import {
  FieldRenderer,
  FieldDef,
} from "@/components/features/student/forms/fieldRenderer";

/**
 * The form builder.
 * Changes based on field inputs.
 *
 * @component
 */
const DynamicForm = ({ form }: { form: string }) => {
  const { fields: rawFields, error: loadError } = useDynamicFormSchema(form);

  // Map DB fields → renderer defs (memoized for clean deps)
  const defs: FieldDef[] = useMemo(
    () =>
      (rawFields ?? []).map((f) => ({
        id: f.id,
        key: f.name,
        label: f.label ?? f.name,
        type: f.type, // "text" | "number" | "select" | "date" | "time"
        required: f.required ?? true,
        placeholder: f.placeholder,
        helper: f.helper,
        maxLength: f.max_length,
        options: f.options,
        validators: (f.validators ?? []) as z.ZodTypeAny[],
      })),
    [rawFields],
  );

  // Form data & validation state (keep same pattern as your original)
  const { formData, setField } = useFormData<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validatorFns, setValidatorFns] = useState<
    Record<string, ((v: any) => string | null)[]>
  >({});

  // Initialize fields and compile validators when defs change
  useEffect(() => {
    if (!defs.length) return;

    // Initialize values as empty strings (consistent with original)
    for (const d of defs) setField(d.key, "");

    setValidatorFns(compileValidators(defs));
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defs]);

  // Debounced validation
  useEffect(() => {
    const id = setTimeout(() => {
      setErrors(validateAll(defs, formData, validatorFns));
    }, 400);
    return () => clearTimeout(id);
  }, [defs, formData, validatorFns]);

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
          />
        </div>
      ))}
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

/**
 * The forms page component
 *
 * @component
 */
type TabKey = "Form Generator" | "My Forms";
export default function FormsPage() {
  const [tab, setTab] = useState<TabKey>("Form Generator");

  return (
    <div className="container max-w-6xl px-4 sm:px-10 pt-6 sm:pt-16 mx-auto">
      <div className="mb-6 sm:mb-8 animate-fade-in space-y-5">
        {/* Header */}
        <DynamicForm form="it-endorsement-letter" />

        <div>
          <div className="flex flex-row items-center gap-3 mb-2">
            <HeaderIcon icon={Newspaper} />
            <HeaderText>Forms</HeaderText>
          </div>
          <div className="flex-1 flex-row">
            <p className="text-gray-600 text-sm sm:text-base mb-2">
              Automatically generate the internship forms you need using your
              saved details.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <OutsideTabs
          value={tab}
          onChange={(v) => setTab(v as TabKey)}
          tabs={[
            { key: "Form Generator", label: "Form Generator" },
            { key: "My Forms", label: "My Forms" },
          ]}
        >
          <OutsideTabPanel when="Form Generator" activeKey={tab}>
            <div>Panel 1</div>
          </OutsideTabPanel>

          <OutsideTabPanel when="My Forms" activeKey={tab}>
            <div>Panel 2</div>
          </OutsideTabPanel>
        </OutsideTabs>
      </div>
    </div>
  );
}
