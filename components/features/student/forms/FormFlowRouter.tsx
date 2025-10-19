"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { UserService } from "@/lib/api/services";
import { DynamicForm } from "./DynamicForm";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useProfileActions } from "@/lib/api/student.actions.api";
import { StepComplete } from "./StepComplete";
import { useProfileData } from "@/lib/api/student.data.api";

type SectionKey = "student" | "university" | "entity" | "internship";

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
type FormValues = Record<string, unknown>;

type Employer = {
  id: string | number;
  display_name?: string;
  legal_entity_name?: string;
  legal_identifier?: string;
  contact_name?: string;
  contact_email?: string;
  address?: string;
};

type EntitiesListResponse = {
  employers: Employer[];
};

export function FormFlowRouter({
  baseForm,
  onGoToMyForms,
}: {
  baseForm: string;
  onGoToMyForms?: () => void;
}) {
  const formName = baseForm;

  const { update } = useProfileActions();
  const { data: profileData } = useProfileData();

  const [done, setDone] = useState(false);

  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const [mainDefs, setMainDefs] = useState<FieldDef[]>([]);

  // saved autofill
  const savedFlat =
    (profileData?.internship_moa_fields as
      | Record<string, string>
      | undefined) ?? undefined;

  console.log("💾 Saved flat:", savedFlat);

  // seed from saved
  useEffect(() => {
    if (!savedFlat || !mainDefs.length) return;
    setValues((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const d of mainDefs) {
        const fromSaved = savedFlat[d.key];
        if (fromSaved !== undefined && shouldSeed(prev[d.key])) {
          next[d.key] = fromSaved;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [mainDefs, savedFlat]);

  // fetch companies
  const { data } = useQuery<EntitiesListResponse>({
    queryKey: ["entities", "list"],
    queryFn: UserService.getEntityList,
    refetchOnMount: "always",
    staleTime: 60_000,
  });
  const companiesRaw: Employer[] = data?.employers ?? [];

  // sync local selection with "entity-id" written by FieldRenderer
  const [selection, setSelection] = useState<string>("");
  useEffect(() => {
    const id = String(values["entity-id"] ?? "");
    if (id && id !== selection) setSelection(id);
  }, [values["entity-id"]]);

  const validatorFns = useMemo(() => compileValidators(mainDefs), [mainDefs]);

  const setField = useCallback((key: string, v: unknown) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    if (key === "entity-id") setSelection(String(v ?? ""));
  }, []);

  const validateNow = useCallback(() => {
    const next = validateAll(mainDefs, values, validatorFns);
    setErrors(next);
    return next;
  }, [mainDefs, values, validatorFns]);

  const handleSubmit = useCallback(
    async (withEsign?: boolean) => {
      setSubmitted(true);
      if (!profileData?.id) return;

      const next = validateNow();
      if (Object.values(next).some(Boolean)) return;

      const baseFromAutofill: Record<string, string> = { ...(savedFlat ?? {}) };

      // all current form fields
      const fromFormNow: Record<string, string> = {};
      for (const d of mainDefs) {
        const v = values[d.key];
        fromFormNow[d.key] = v === undefined || v === null ? "" : String(v);
      }
      let finalFlat: Record<string, string> = {
        ...baseFromAutofill,
        ...fromFormNow,
      };

      // if an entity is selected, replace entity fields with its data
      const entityId = String(values["entity-id"] ?? selection ?? "");
      const selectedFull = entityId
        ? companiesRaw.find((c) => String(c.id) === entityId)
        : undefined;

      if (entityId) {
        const supplements: Record<string, string> = {
          "entity-id": entityId,
          "entity-legal-name": selectedFull?.legal_entity_name ?? "",
          "entity-legal-identifier": selectedFull?.legal_identifier ?? "",
          "entity-address": selectedFull?.address ?? "",
          "entity-representative-name": selectedFull?.contact_name ?? "",
          "entity-representative-email": selectedFull?.contact_email ?? "",
        };

        // apply supplements only when non-empty, so we don't wipe user edits
        for (const [k, v] of Object.entries(supplements)) {
          const trimmed = (v ?? "").trim();
          if (trimmed !== "") finalFlat[k] = trimmed;
        }
      }

      finalFlat = {
        ...flattenProfileShape(finalFlat),
      };

      console.log("🧾 Submitting flat payload:", finalFlat);

      try {
        setBusy(true);

        await update.mutateAsync({ internship_moa_fields: finalFlat });

        const route = withEsign ? "submitSignedForm" : "submitPendingForm";
        await (UserService as any)[route]({
          formName,
          values: finalFlat,
          parties: {
            userId: profileData.id,
            employerId: entityId || undefined,
          },
        });

        setDone(true);
        setSubmitted(false);
      } catch (e) {
        console.error("Submission error", e);
      } finally {
        setBusy(false);
      }
    },
    [
      mainDefs,
      values,
      validateNow,
      update,
      companiesRaw,
      profileData?.id,
      formName,
      selection,
      savedFlat,
    ],
  );

  if (done) return <StepComplete onMyForms={() => onGoToMyForms?.()} />;

  return (
    <div className="space-y-4">
      <DynamicForm
        form={formName}
        values={values}
        onChange={setField}
        onSchema={(defs) => setMainDefs(defs as FieldDef[])}
        showErrors={submitted}
        errors={errors}
      />

      <div className="pt-2 flex justify-end gap-2 flex-wrap ">
        <Button
          onClick={() => void handleSubmit()}
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
          onClick={() => void handleSubmit(true)}
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

/* ───────── helpers ───────── */

function compileValidators(defs: FieldDef[]) {
  const map: Record<string, ((v: unknown) => string | null)[]> = {};
  for (const d of defs) {
    const schemas = d.validators ?? [];
    map[d.key] = schemas.map((schema) => (value: unknown) => {
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
  values: Record<string, unknown>,
  validatorFns: Record<string, ((v: unknown) => string | null)[]>,
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

// only seed when empty/undefined
function shouldSeed(current: unknown) {
  return current === undefined || current === "";
}

// Flatten a possibly sectioned shape into a plain flat map of strings
function flattenProfileShape(input: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!input || typeof input !== "object") return out;

  const obj = input as Record<string, unknown>;
  const sections: SectionKey[] = [
    "student",
    "university",
    "internship",
    "entity",
  ];

  // copy top-level stringy keys
  for (const [k, v] of Object.entries(obj)) {
    if (!sections.includes(k as SectionKey)) {
      if (
        typeof v === "string" ||
        typeof v === "number" ||
        typeof v === "boolean"
      ) {
        out[k] = String(v);
      }
    }
  }

  // expand sectioned objects
  for (const sec of sections) {
    const block = obj[sec];
    if (block && typeof block === "object") {
      for (const [k, v] of Object.entries(block as Record<string, unknown>)) {
        if (v === undefined || v === null) continue;
        out[k] = typeof v === "string" ? v : String(v);
      }
    }
  }

  return out;
}
