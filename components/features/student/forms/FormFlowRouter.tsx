"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { UserService } from "@/lib/api/services";
import { DynamicForm } from "./DynamicForm";
import { FormDropdown, FormInput } from "@/components/EditForm";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useProfileActions } from "@/lib/api/student.actions.api";
import { StepComplete } from "./StepComplete";
import { useProfileData } from "@/lib/api/student.data.api";

type Mode = "select" | "manual" | "invite";
type SectionKey = "student" | "university" | "entity";

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

export const FormFieldMappings = {
  employer_id: "",
};

type Errors = Record<string, string>;
type FormValues = Record<string, any>;

export function FormFlowRouter({
  baseForm,
  onGoToMyForms,
  allowInvite = true,
}: {
  baseForm: string;
  onGoToMyForms?: () => void;
  allowInvite?: boolean;
}) {
  const { update } = useProfileActions();
  const { data: profileData } = useProfileData();

  const [selection, setSelection] = useState<string | null>(); // company id only
  const [mode, setMode] = useState<Mode>("select");
  const [done, setDone] = useState(false);

  // centralized form state
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  // children will report their field defs so we can validate in one place
  const [mainDefs, setMainDefs] = useState<FieldDef[]>([]);

  // i am thou profile
  const savedFields = profileData?.internship_moa_fields as
    | {
        student?: Record<string, string>;
        university?: Record<string, string>;
        entity?: Record<string, string>;
      }
    | undefined;

  useEffect(() => {
    const { student, university, internship, entity } =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      groupBySectionUsingNames(mainDefs, {
        ...values,
        ...(profileData?.internship_moa_fields as any),
      });

    console.log("INIT", {
      ...values,
      ...(profileData?.internship_moa_fields as any),
    });

    setValues({ student, university, internship, entity });
  }, [profileData?.internship_moa_fields]);

  // i fill up the forms AUTOMATICALLY
  useEffect(() => {
    if (!savedFields) return;
    if (!mainDefs.length) return;

    setValues((prev) => {
      const next = { ...prev };
      let changed = false;

      for (const d of mainDefs) {
        const sec = d.section; // "student" | "university" | "entity"
        const fromSaved = savedFields?.[sec]?.[d.key];
        if (fromSaved !== undefined && shouldSeed(prev[d.key])) {
          next[d.key] = fromSaved;
          changed = true;
        }
      }

      return changed ? next : prev;
    });

    // preselect company for select mode if not chosen yet
    if (mode === "select" && !selection) {
      const maybeId =
        savedFields?.entity?.employer_id ?? savedFields?.entity?.company_id; // legacy fallback
      if (maybeId) setSelection(String(maybeId));
    }
  }, [mode, mainDefs, savedFields, selection, setValues, setSelection]);

  const formName = baseForm;

  // fetch companies
  const { data } = useQuery({
    queryKey: ["companies:list"],
    queryFn: async () => await UserService.getEntityList(),
    staleTime: 60_000,
  });

  const companiesRaw = data?.employers ?? [];
  const companies: Array<{ id: string; name: string }> = companiesRaw.map(
    (c) => ({ id: String(c.id), name: c.legal_entity_name }),
  );

  const validatorFns = useMemo(() => compileValidators(mainDefs), [mainDefs]);

  const setField = useCallback((key: string, v: string) => {
    setValues((prev) => ({ ...prev, [key]: v }));
  }, []);

  const validateNow = useCallback(() => {
    const next = validateAll(mainDefs, values, validatorFns);
    setErrors(next);
    return next;
  }, [mainDefs, values, validatorFns]);

  const handleSubmit = useCallback(async () => {
    setSubmitted(true);

    if (!profileData?.id) return;
    console.log("values", values);

    const next = validateNow();
    if (Object.values(next).some(Boolean)) return;
    const { student, university, internship, entity } =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      groupBySectionUsingNames(mainDefs, {
        ...values,
        ...(profileData.internship_moa_fields as any),
      });

    const selected = companies.find((c) => c.id === selection);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const entityPatched = {
      ...entity,
      employer_id: selection,
      employer_legal_name: selected?.name,
    };

    const profilePayload = {
      student,
      university,
      internship,
      entity: entityPatched,
    };

    try {
      setBusy(true);

      // Update server-side internship fields
      await update.mutateAsync({
        internship_moa_fields: profilePayload,
      });

      await UserService.submitSignedForm({
        formName: formName,
        values: {
          ...student,
          ...university,
          ...internship,
          ...entityPatched,
        },
        parties: {
          userId: profileData.id,
          employerId: selection,
        },
      });
      setDone(true);
      setSubmitted(false);
    } catch (e) {
      console.error("Submission error", e);
    } finally {
      setBusy(false);
    }
  }, [
    mode,
    selection,
    mainDefs,
    values,
    formName,
    validateNow,
    update,
    companies,
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

  return (
    <div className="space-y-4">
      {/* <h3 className="text-sm font-semibold text-gray-700">Company Information</h3>

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
          {allowInvite ? (
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
                >
                  Fill out their details manually
                </button>
              )}
              {allowInvite}
            </p>
          ) : null}
        </>
      ) : (
        <div className="flex items-center justify-between rounded-[0.33em] border bg-card px-3 py-2 bg-gray-200">
          <div className="text-sm">
            {mode === "invite"
              ? "Fill company details manually"
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
      )} */}

      {/* {mode === "invite" && allowInvite && (
        <>
        </>
      )} */}

      {/* main form always shown; its schema changes with mode */}
      <DynamicForm
        form={formName}
        values={values}
        onChange={setField}
        onSchema={(defs) => {
          setMainDefs(defs as FieldDef[]);
        }}
        showErrors={submitted}
        errors={errors}
      />

      <div className="pt-2 flex justify-end gap-2 flex-wrap ">
        <Button
          onClick={() => {
            void handleSubmit();
          }}
          variant="outline"
          className="w-full sm:w-auto"
          disabled={busy}
          aria-busy={busy}
        >
          {busy ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating
            </span>
          ) : (
            "Generate without e-sign"
          )}
        </Button>
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
              Generating...
            </span>
          ) : (
            "Generate with e-sign"
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
    const schemas = d.validators ?? [];
    map[d.key] = schemas.map((schema) => (value: any) => {
      const res = schema.safeParse(value);
      if (res.success) return null;
      const issues = res.error.issues as { message: string }[] | undefined;
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
  const out = {
    student: values.student ?? ({} as Record<string, string>),
    internship: values.internship ?? ({} as Record<string, string>),
    university: values.university ?? ({} as Record<string, string>),
    entity: values.entity ?? ({} as Record<string, string>),
  };

  for (const d of defs) {
    const val = values[d.key] ?? values[d.id];
    if (val === undefined) continue;
    out[d.section][d.key] = val;
  }
  return out;
}

// only seed when empty/undefined
function shouldSeed(current: unknown) {
  return current === undefined || current === "";
}
