"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { UserService } from "@/lib/api/services";
import { DynamicForm } from "./DynamicForm";
import { FormDropdown } from "@/components/EditForm";
import { EntityFieldsOnly } from "./EntityFieldsOnly";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type Mode = "select" | "manual" | "invite";
type SectionKey = "student" | "university" | "entity";
type Sectioned = Record<SectionKey, Record<string, any>>;

export type FieldDef = {
  id: string | number;
  key: string;
  label: string;
  type: string;
  placeholder?: string;
  helper?: string;
  maxLength?: number;
  options?: Array<{ id: string | number; name: string }>;
  validators?: z.ZodTypeAny[];
  section: SectionKey;
};

type Errors = Record<string, string>;
type FormValues = Record<string, any>;

export function FormFlowRouter({
  baseForm,
  onSubmit,
}: {
  baseForm: string;
  onSubmit?: (payload: {
    mode: Mode;
    formName: string;
    student: Record<string, any>;
    university: Record<string, any>;
    entity: Record<string, any>;
  }) => Promise<void> | void;
}) {
  const [selection, setSelection] = useState<string>(""); // company id only
  const [mode, setMode] = useState<Mode>("select");

  // centralized form state
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  // children will report their field defs so we can validate in one place
  const [mainDefs, setMainDefs] = useState<FieldDef[]>([]);
  const [entityDefs, setEntityDefs] = useState<FieldDef[]>([]);

  const formName =
    mode === "select"
      ? `${baseForm}`
      : mode === "invite"
        ? `${baseForm}-invite`
        : `${baseForm}-manual`;

  // fetch companies
  const {
    data,
    isLoading: loadingCompanies,
    error: companiesError,
  } = useQuery({
    queryKey: ["companies:list"],
    queryFn: UserService.getEntityList,
    staleTime: 60_000,
  });

  const companiesRaw = data?.employers ?? [];
  const companies: Array<{ id: string; name: string }> = companiesRaw.map(
    (c: any) => ({ id: String(c.id), name: c.legal_entity_name }),
  );

  /* ---------------- helpers: validators & validation ---------------- */
  const allDefs = useMemo(() => {
    // only include Entity fields if we are in invite/manual modes
    if (mode === "select") return mainDefs;
    return [...mainDefs, ...entityDefs];
  }, [mainDefs, entityDefs, mode]);

  const validatorFns = useMemo(() => compileValidators(allDefs), [allDefs]);

  const setField = useCallback((key: string, v: any) => {
    setValues((prev) => ({ ...prev, [key]: v }));
  }, []);

  const validateNow = useCallback(() => {
    const next = validateAll(allDefs, values, validatorFns);
    setErrors(next);
    return next;
  }, [allDefs, values, validatorFns]);

  /* ---------------- submit ---------------- */
  const handleSubmit = useCallback(async () => {
    setSubmitted(true);

    // require a company when in "select" mode
    if (mode === "select" && !selection) {
      setErrors((e) => ({ ...e, __company__: "Please select a company." }));
      return;
    }

    const next = validateNow();
    const hasErrors = Object.values(next).some(Boolean);
    if (hasErrors) return;

    const defsToUse =
      mode === "select" ? mainDefs : [...mainDefs, ...entityDefs]; // this merges schemas depending on mode

    const { student, university, entity } = groupValuesBySection(
      defsToUse,
      values,
    ); // split values by section

    // insert when on select mode
    const selected = companies.find((c) => c.id === selection);
    const entityPatched = {
      ...entity,
      company_id: selection,
      company_name: selected?.name,
    };

    const payload = {
      formName,
      values,
      student,
      university,
      entity: entityPatched,
    };

    try {
      setBusy(true);
      if (onSubmit) {
        await onSubmit(payload);
      } else {
        // default behavior if no callback provided: just log
        // eslint-disable-next-line no-console
        console.log("FormFlowRouter submit payload →", payload);
      }
    } finally {
      setBusy(false);
    }
  }, [mode, selection, entityDefs, values, formName, onSubmit, validateNow]);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Employer</h3>

      {/* SELECT MODE: show dropdown + actions */}
      {mode === "select" ? (
        <>
          <FormDropdown
            label="Select your company"
            required
            value={selection}
            options={companies.map((c) => ({ id: c.id, name: c.name }))}
            setter={(v: string | number | null) => {
              const val = String(v ?? "");
              setSelection(val);
            }}
            className="w-full"
          />
          {submitted && errors.__company__ && (
            <p className="text-xs text-rose-600 mt-1">{errors.__company__}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Company not in our list?{" "}
            <button
              type="button"
              className="underline underline-offset-4 hover:no-underline mr-2"
              onClick={() => {
                setMode("invite");
                setSelection("");
              }}
              disabled={loadingCompanies || !!companiesError}
            >
              Invite them to fill it in
            </button>
            or{" "}
            <button
              type="button"
              className="underline underline-offset-4 hover:no-underline"
              onClick={() => {
                setMode("manual");
                setSelection("");
              }}
              disabled={loadingCompanies || !!companiesError}
            >
              I’ll fill details manually
            </button>
            .
          </p>
        </>
      ) : (
        /* INVITE/MANUAL MODE: hide dropdown, show back-to-select */
        <div className="flex items-center justify-between rounded-[0.33em] border bg-card px-3 py-2 bg-gray-200">
          <div className="text-sm">
            {mode === "invite"
              ? "Invite the company to complete details"
              : "Fill company details manually"}
          </div>
          <button
            type="button"
            className="text-xs underline underline-offset-4 hover:no-underline"
            onClick={() => {
              setMode("select");
              setSelection("");
            }}
          >
            Back to company picker
          </button>
        </div>
      )}

      {/* employer-only fields appear for invite/manual */}
      {mode !== "select" && (
        <EntityFieldsOnly
          form={`${baseForm}-${mode}`}
          values={values}
          onChange={setField}
          onSchema={setEntityDefs}
          showErrors={submitted}
          errors={errors}
        />
      )}

      {/* main form always shown; its schema changes with mode */}
      <DynamicForm
        form={formName}
        values={values}
        onChange={setField}
        onSchema={setMainDefs}
        showErrors={submitted}
        errors={errors}
      />

      <div className="pt-2 flex justify-end">
        <Button
          onClick={handleSubmit}
          className="w-full sm:w-auto"
          disabled={busy}
          aria-busy={busy}
        >
          {busy ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting…
            </span>
          ) : (
            "Submit"
          )}
        </Button>
      </div>
    </div>
  );
}

/* ───────────────────────── helpers ───────────────────────── */

function compileValidators(defs: FieldDef[]) {
  const map: Record<string, ((v: any) => string | null)[]> = {};
  for (const d of defs) {
    const schemas = (d.validators ?? []) as z.ZodTypeAny[];
    map[d.key] = schemas.map((schema) => (value: any) => {
      const res = schema.safeParse(value);
      if (res.success) return null;
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
  values: Record<string, any>,
  validatorFns: Record<string, ((v: any) => string | null)[]>,
) {
  const next: Record<string, string> = {};
  for (const d of defs) {
    const fns = validatorFns[d.key] ?? [];
    const val = values[d.key];
    const firstErr = fns.map((fn) => fn(val)).find(Boolean) ?? "";
    next[d.key] = firstErr || "";
  }
  return next;
}

function groupValuesBySection(
  defs: FieldDef[],
  values: Record<string, any>,
): Sectioned {
  const out: Sectioned = { student: {}, university: {}, entity: {} };
  for (const d of defs) {
    // d.section is "student" | "university" | "entity"
    const sec = (d.section ?? "student") as SectionKey;
    if (d.key in values) out[sec][d.key] = values[d.key];
  }
  return out;
}
