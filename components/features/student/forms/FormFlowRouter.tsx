"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { UserService } from "@/lib/api/services";
import { DynamicForm } from "./DynamicForm";
import { FormDropdown } from "@/components/EditForm";
import { EntityFieldsOnly } from "./EntityFieldsOnly";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useProfileActions } from "@/lib/api/student.actions.api";
import { StepComplete } from "./StepComplete";
import { useProfileData } from "@/lib/api/student.data.api";
import { PublicUser } from "@/lib/db/db.types";

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

type Errors = Record<string, string>;
type FormValues = Record<string, any>;

export function FormFlowRouter({
  baseForm,
  onGoToMyForms,
  allowInvite = false,
  allowManual = false,
}: {
  baseForm: string;
  onGoToMyForms?: () => void;
  allowInvite?: boolean;
  allowManual?: boolean;
}) {
  const { update } = useProfileActions();
  const { data: profileData } = useProfileData();

  const [selection, setSelection] = useState<string>(""); // company id only
  const [mode, setMode] = useState<Mode>("select");
  const [done, setDone] = useState(false);

  // centralized form state
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  // children will report their field defs so we can validate in one place
  const [mainDefs, setMainDefs] = useState<FieldDef[]>([]);
  const [entityDefs, setEntityDefs] = useState<FieldDef[]>([]);

  // i am thou profile
  const savedFields = profileData?.internship_moa_fields as
    | {
        student?: Record<string, any>;
        university?: Record<string, any>;
        entity?: Record<string, any>;
      }
    | undefined;

  // i fill up the forms AUTOMATICALLY
  useEffect(() => {
    if (!savedFields) return;

    const defsToUse =
      mode === "select" ? mainDefs : [...mainDefs, ...entityDefs];
    if (!defsToUse.length) return;

    setValues((prev) => {
      const next = { ...prev };
      let changed = false;

      for (const d of defsToUse) {
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
  }, [
    mode,
    mainDefs,
    entityDefs,
    savedFields,
    selection,
    setValues,
    setSelection,
  ]);

  const formName =
    mode === "select"
      ? `${baseForm}`
      : mode === "invite"
        ? `${baseForm}-invite`
        : `${baseForm}-manual`;

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

  const allDefs = useMemo(() => {
    // only include Entity fields if we are in invite/manual modes
    if (mode === "select") return mainDefs;
    return [...mainDefs, ...entityDefs];
  }, [mainDefs, entityDefs, mode]);

  const validatorFns = useMemo(() => compileValidators(allDefs), [allDefs]);

  const setField = useCallback((key: string, v: string) => {
    setValues((prev) => ({ ...prev, [key]: v }));
  }, []);

  const validateNow = useCallback(() => {
    const next = validateAll(allDefs, values, validatorFns);
    setErrors(next);
    return next;
  }, [allDefs, values, validatorFns]);

  const handleSubmit = useCallback(async () => {
    setSubmitted(true);

    if (mode === "select" && !selection) {
      setErrors((e) => ({ ...e, __company__: "Please select a company." }));
      return;
    }

    const next = validateNow();
    if (Object.values(next).some(Boolean)) return;

    const defsToUse =
      mode === "select" ? mainDefs : [...mainDefs, ...entityDefs];

    const { student, university, internship, entity } =
      groupBySectionUsingNames(defsToUse, values);

    const selected = companies.find((c) => c.id === selection);
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

      const updateRes = await update.mutateAsync({
        internship_moa_fields: profilePayload,
      });

      const mergedFromServer = updateRes.user;

      const submitPayload = {
        formName,
        ...mergedFromServer, // { student, university, entity, internship } from server
      };

      await UserService.submitForm(submitPayload);
      console.log("submitted", submitPayload);
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
    entityDefs,
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
                  Invite them to fill it in
                </button>
              )}
              {allowInvite}
            </p>
          ) : null}
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

      {/* show employer only fields only when mode is allowed */}
      {mode === "invite" && allowInvite && (
        <EntityFieldsOnly
          form={`${baseForm}-invite`}
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

/* ───────────────────────── helpers ───────────────────────── */

function compileValidators(defs: FieldDef[]) {
  const map: Record<string, ((v: any) => string | null)[]> = {};
  for (const d of defs) {
    const schemas = d.validators ?? [];
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
    student: {} as Record<string, string>,
    internship: {},
    university: {},
    entity: {},
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
