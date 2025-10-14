"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { UserService } from "@/lib/api/services";
import { DynamicForm } from "./DynamicForm";
import { FormDropdown } from "@/components/EditForm";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { StepComplete } from "./StepComplete";

type Mode = "select" | "manual" | "invite";
type Audience = "company" | "guardian";
type SectionKey = "student" | "university" | "entity" | "guardian";

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

export function RecipientFlowRouter({
  baseForm,
  audience = "company",
  allowInvite = true,
  onGoToMyForms,
  onSubmit,
}: {
  baseForm: string;
  audience?: Audience;
  allowInvite?: boolean;
  onGoToMyForms?: () => void;
  onSubmit?: (payload: {
    formName: string;
    student?: Record<string, any>;
    university?: Record<string, any>;
    entity?: Record<string, any>;
    guardian?: Record<string, any>;
  }) => Promise<void> | void;
}) {
  // company-only state
  const [selection, setSelection] = useState<string>("");
  const [mode, setMode] = useState<Mode>("select");

  const [done, setDone] = useState(false);
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  // fields from DynamicForm
  const [mainDefs, setMainDefs] = useState<FieldDef[]>([]);

  const formName =
    audience === "company"
      ? mode === "select"
        ? `${baseForm}`
        : mode === "invite"
          ? `${baseForm}-invite`
          : `${baseForm}-manual`
      : `${baseForm}`;

  const {
    data: companiesData,
    isLoading: loadingCompanies,
    error: companiesError,
  } = useQuery({
    queryKey: ["companies:list"],
    queryFn: async () => await UserService.getEntityList(),
    staleTime: 60_000,
    enabled: audience === "company",
  });

  const companiesRaw = companiesData?.employers ?? [];
  const companies: Array<{ id: string; name: string }> = companiesRaw.map(
    (c) => ({ id: String(c.id), name: c.legal_entity_name }),
  );

  // Filter: only show relevant sections
  const fieldFilter = useMemo(() => {
    if (audience === "guardian") {
      // guardians see guardian + applicant(student) fields
      return (d: FieldDef) =>
        d.section === "guardian" || d.section === "student";
    }
    // companies see entity fields (schema can still add others if needed)
    return (d: FieldDef) =>
      d.section === "entity" || d.section === "university";
  }, [audience]);

  const sectionTitleMap = useMemo(() => {
    if (audience === "guardian") {
      return {
        student: "Applicant Details",
        guardian: "Guardian Details",
        entity: null,
        university: null,
      } as Record<string, string | null>;
    }
    return {
      entity: "Company Details",
      university: "Internship / University Details",
      student: null,
      guardian: null,
    } as Record<string, string | null>;
  }, [audience]);

  // validation
  const validatorFns = useMemo(() => compileValidators(mainDefs), [mainDefs]);
  const setField = useCallback((key: string, v: string) => {
    setValues((prev) => ({ ...prev, [key]: v }));
  }, []);
  const validateNow = useCallback(() => {
    const next = validateAll(mainDefs, values, validatorFns);
    setErrors(next);
    return next;
  }, [mainDefs, values, validatorFns]);

  // submit
  const handleSubmit = useCallback(async () => {
    setSubmitted(true);

    if (audience === "company" && mode === "select" && !selection) {
      setErrors((e) => ({ ...e, __company__: "Please select a company." }));
      return;
    }

    const next = validateNow();
    if (Object.values(next).some(Boolean)) return;

    const grouped = groupBySectionUsingNames(mainDefs, values);
    const { student, university, entity, guardian } = grouped;

    // Patch entity identity from picker (if present)
    let entityPatched = entity;
    if (audience === "company") {
      const selected = companies.find((c) => c.id === selection);
      if (selected || selection) {
        entityPatched = {
          ...(entity ?? {}),
          employer_id: selection || entity?.employer_id,
          employer_legal_name: selected?.name || entity?.employer_legal_name,
        };
      }
    }

    const submitPayload = {
      formName,
      ...(student ? { student } : {}),
      ...(university ? { university } : {}),
      ...(entityPatched ? { entity: entityPatched } : {}),
      ...(guardian ? { guardian } : {}),
    };

    try {
      setBusy(true);
      if (onSubmit) {
        await onSubmit(submitPayload);
      } else {
        await UserService.submitForm(submitPayload);
      }
      setDone(true);
      setSubmitted(false);
    } catch (e) {
      console.error("Submission error", e);
    } finally {
      setBusy(false);
    }
  }, [
    audience,
    mode,
    selection,
    mainDefs,
    values,
    formName,
    companies,
    onSubmit,
    validateNow,
  ]);

  if (done) {
    return (
      <StepComplete
        onMyForms={() => {
          onGoToMyForms?.();
        }}
      />
    );
  }

  const showEmployerBlock = audience === "company";

  return (
    <div className="space-y-4">
      {showEmployerBlock && (
        <h3 className="text-sm font-semibold text-gray-700">Employer</h3>
      )}

      {/* COMPANY: SELECT MODE */}
      {showEmployerBlock && mode === "select" ? (
        <>
          <FormDropdown
            label="Select your company"
            required
            value={selection}
            options={companies.map((c) => ({ id: c.id, name: c.name }))}
            setter={(v: string | number | null) =>
              setSelection(String(v ?? ""))
            }
            className="w-full"
          />
          {submitted && errors.__company__ && (
            <p className="text-xs text-rose-600 mt-1">{errors.__company__}</p>
          )}

          {allowInvite && (
            <p className="text-xs text-muted-foreground">
              Company not in our list?{" "}
              {allowInvite && (
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
              )}
              .
            </p>
          )}
        </>
      ) : showEmployerBlock ? (
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
      ) : null}

      <DynamicForm
        form={formName}
        values={values}
        onChange={setField}
        onSchema={(defs) => setMainDefs(defs as FieldDef[])}
        errors={errors}
        showErrors={submitted}
        fieldFilter={(d: FieldDef) => fieldFilter(d)}
        sectionTitleMap={sectionTitleMap}
        emptyHint="All required fields for you have been completed."
      />

      <div className="pt-2 flex justify-end">
        <Button
          onClick={() => {
            void handleSubmit();
          }}
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

/* ───────────── helpers ───────────── */

function compileValidators(defs: FieldDef[]) {
  const map: Record<string, ((v: any) => string | null)[]> = {};
  for (const d of defs) {
    const schemas = d.validators ?? [];
    map[d.key] = schemas.map((schema) => (value: any) => {
      const res = schema.safeParse(value);
      if (res.success) return null;
      const issues = res.error?.issues as { message: string }[] | undefined;
      return issues?.map((i) => i.message).join("\n") ?? res.error.message;
    });
  }
  return map;
}

function validateAll(
  defs: FieldDef[],
  values: Record<string, string>,
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

function groupBySectionUsingNames(
  defs: FieldDef[],
  values: Record<string, string>,
) {
  const out: Record<string, Record<string, string>> = {};
  for (const d of defs) {
    const val = values[d.key] ?? values[d.id];
    if (val === undefined) continue;
    if (!out[d.section]) out[d.section] = {};
    out[d.section][d.key] = val;
  }
  return out;
}
