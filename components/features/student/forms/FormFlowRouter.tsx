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
type Mode = "select" | "invite" | "manual";

export type FieldDef = {
  id: string | number;
  key: string;
  label: string;
  type: string;
  placeholder?: string;
  helper?: string;
  maxLength?: number;
  options?: Array<{ id: string | number; name: string }>;
  validators?: Array<z.ZodTypeAny | RegExp | ((v: unknown) => unknown)>;
  section: SectionKey;
};

type Errors = Record<string, string>;
type FormValues = Record<string, unknown>;

type Entity = {
  id: string | number;
  display_name?: string;
  legal_entity_name?: string;
  legal_identifier?: string;
  contact_name?: string;
  contact_email?: string;
  address?: string;
};

type EntitiesListResponse = {
  employers: Entity[];
};

export function FormFlowRouter({
  baseForm,
  onGoToMyForms,
  supportsInvite = false,
  supportsManual = false,
}: {
  baseForm: string;
  onGoToMyForms?: () => void;
  supportsInvite?: boolean;
  supportsManual?: boolean;
}) {
  const { update } = useProfileActions();
  const { data: profileData } = useProfileData();

  const [done, setDone] = useState(false);
  const [mode, setMode] = useState<Mode>("select");

  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const [mainDefs, setMainDefs] = useState<FieldDef[]>([]);

  useEffect(() => {
    if (mode !== "select") {
      setSelection("");
      setValues((prev) => ({ ...prev, "entity-id": "" }));
    }
  }, [mode]);

  const formName = useMemo(() => {
    if (mode === "invite") return `${baseForm}-invite`;
    if (mode === "manual") return `${baseForm}-manual`;
    return baseForm;
  }, [baseForm, mode]);

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
        if (fromSaved !== undefined && isEmptyFor(d, prev[d.key])) {
          const coerced = coerceForDef(d, fromSaved);
          if (coerced !== undefined) {
            next[d.key] = coerced;
            changed = true;
          }
        }
      }
      return changed ? next : prev;
    });
  }, [mainDefs, savedFlat]);

  // fetch companies
  const { data } = useQuery<EntitiesListResponse>({
    queryKey: ["entities", "list"],
    queryFn: () => UserService.getEntityList(),
  });
  const companiesRaw: Entity[] = data?.employers ?? [];

  // sync local selection with "entity-id" written by FieldRenderer
  const [selection, setSelection] = useState<string>("");
  useEffect(() => {
    const raw = values["entity-id"];
    const id = typeof raw === "string" ? raw : raw == null ? "" : String(raw);

    if (id && id !== selection) setSelection(id);
  }, [values["entity-id"]]);

  const validatorFns = useMemo(() => compileValidators(mainDefs), [mainDefs]);

  const setField = useCallback((key: string, v: unknown) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    if (key === "entity-id") {
      const id = typeof v === "string" ? v : v == null ? "" : String(v);
      setSelection(id);
    }
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
        let s = v == null ? "" : String(v);
        if (s === "undefined") s = "";
        fromFormNow[d.key] = s;
      }

      let finalFlat: Record<string, string> = {
        ...baseFromAutofill,
        ...fromFormNow,
      };

      // If SELECT mode and an entity is chosen, enrich with entity info
      const entityId = mode === "select" ? String(selection || "") : "";
      const selectedFull =
        mode === "select" && entityId
          ? companiesRaw.find((c) => String(c.id) === entityId)
          : undefined;

      if (mode === "select" && entityId) {
        const supplements: Record<string, string> = {
          "entity-id": entityId,
          "entity-legal-name": selectedFull?.legal_entity_name ?? "",
          "entity-legal-identifier": selectedFull?.legal_identifier ?? "",
          "entity-address": selectedFull?.address ?? "",
          "entity-representative-name": selectedFull?.contact_name ?? "",
          "entity-representative-email": selectedFull?.contact_email ?? "",
        };
        for (const [k, v] of Object.entries(supplements)) {
          const trimmed = (v ?? "").trim();
          if (trimmed !== "") finalFlat[k] = trimmed;
        }
      }

      if (finalFlat["entity-id"] === "undefined") {
        finalFlat["entity-id"] = "";
      }

      finalFlat = {
        ...flattenProfileShape(finalFlat),
      };

      console.log("🧾 Submitting flat payload:", finalFlat);

      try {
        setBusy(true);

        await update.mutateAsync({ internship_moa_fields: finalFlat });

        const route = withEsign ? "submitSignedForm" : "submitPendingForm";
        await UserService[route]({
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
        key={formName}
        form={formName}
        values={values}
        onChange={setField}
        onSchema={(defs) => setMainDefs(defs as FieldDef[])}
        showErrors={submitted}
        errors={errors}
        entityMode={mode}
        onEntityModeChange={(m) => setMode(m)}
        entityModeSupport={{ invite: supportsInvite, manual: supportsManual }}
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

function isEmptyFor(def: FieldDef, v: unknown) {
  switch (def.type) {
    case "date":
      return !(typeof v === "number" && v > 0); // 0/undefined = empty
    case "signature":
      return v !== true;
    case "number":
      return v === undefined || v === "";
    case "time":
    case "select":
    case "reference":
    case "text":
    default:
      return v === undefined || v === "";
  }
}

function coerceForDef(def: FieldDef, raw: unknown) {
  switch (def.type) {
    case "number":
      return raw == null ? "" : String(raw);
    case "date":
      return coerceAnyDate(raw); // <— simplified
    case "time":
      return raw == null ? "" : String(raw);
    case "signature":
      return raw === true;
    case "select":
    case "reference":
    case "text":
    default:
      return raw == null ? "" : String(raw);
  }
}

function coerceAnyDate(raw: unknown): number | undefined {
  if (typeof raw === "number") return raw > 0 ? raw : undefined;
  if (typeof raw !== "string") return undefined;
  const s = raw.trim();
  if (!s) return undefined;

  // numeric string (ms epoch)
  if (/^\d{6,}$/.test(s)) {
    const n = Number(s);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }

  // ISO/date-like string
  const ms = Date.parse(s);
  return Number.isFinite(ms) && ms > 0 ? ms : undefined;
}

function compileValidators(defs: FieldDef[]) {
  const isEmpty = (v: unknown) =>
    v === undefined ||
    v === null ||
    (typeof v === "string" && v.trim() === "") ||
    (Array.isArray(v) && v.length === 0);

  const requiredCheckFor = (d: FieldDef) => {
    switch (d.type) {
      case "signature":
        return (v: unknown) => (v === true ? null : "This field is required.");
      case "number":
        return (v: unknown) => {
          const s = v == null ? "" : String(v).trim();
          if (s === "") return "This field is required.";
          const n = Number(s);
          return Number.isFinite(n) ? null : "Enter a valid number.";
        };
      case "date":
        // you store dates as ms epoch; initial 0 == not set
        return (v: unknown) =>
          typeof v === "number" && v > 0 ? null : "Please select a date.";
      case "time":
        return (v: unknown) => {
          const s = v == null ? "" : String(v).trim();
          return s ? null : "Please select a time.";
        };
      case "select":
      case "reference":
        return (v: unknown) => {
          const s = v == null ? "" : String(v).trim();
          return s ? null : "Please choose an option.";
        };
      default: // "text" and anything else -> non-empty string
        return (v: unknown) => (!isEmpty(v) ? null : "This field is required.");
    }
  };

  const map: Record<string, ((v: unknown) => string | null)[]> = {};

  for (const d of defs) {
    const raw = Array.isArray(d.validators) ? d.validators : [];
    const fns: ((v: unknown) => string | null)[] = [];

    // 1) Always add the default required validator first
    fns.push(requiredCheckFor(d));

    // 2) Then append any custom validators (Zod | RegExp | function)
    for (const schema of raw) {
      if (schema && typeof (schema as any).safeParse === "function") {
        const zschema = schema as z.ZodTypeAny;
        fns.push((value: unknown) => {
          const res = zschema.safeParse(value);
          if (res.success) return null;
          const issues = res.error.issues as { message: string }[] | undefined;
          return issues?.map((i) => i.message).join("\n") ?? res.error.message;
        });
        continue;
      }
      if (schema instanceof RegExp) {
        const rx = schema;
        fns.push((value: unknown) => {
          const s = value == null ? "" : String(value);
          return rx.test(s) ? null : "Invalid format.";
        });
        continue;
      }
      if (typeof schema === "function") {
        const fn = schema as (v: unknown) => unknown;
        fns.push((value: unknown) => {
          try {
            const out = fn(value);
            if (out === true || out == null) return null;
            if (out === false) return "Invalid value.";
            if (typeof out === "string") return out || "Invalid value.";
            if (out && typeof (out as any).success === "boolean") {
              return (out as any).success
                ? null
                : ((out as any).error?.message ?? "Invalid value.");
            }
            return null;
          } catch {
            return "Invalid value.";
          }
        });
        continue;
      }
      // Unknown validator type -> ignore
    }

    map[d.key] = fns;
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
