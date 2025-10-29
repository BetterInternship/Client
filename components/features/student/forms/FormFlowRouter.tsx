"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { UserService } from "@/lib/api/services";
import { DynamicForm } from "./DynamicForm";
import { useProfileActions } from "@/lib/api/student.actions.api";
import { StepComplete } from "./StepComplete";
import { useProfileData } from "@/lib/api/student.data.api";
import { buildDerivedValues } from "@/lib/utils/form-utils";
import { useDbRefs } from "@/lib/db/use-refs";
import { GenerateButtons } from "./GenerateFormButtons";
import { addDays } from "date-fns";

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
  params?: Record<string, any>;
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
  const { to_college_name } = useDbRefs(); // TODO: Remove if hard coded derivations not needed anymore

  const { update } = useProfileActions();
  const { data: profileData } = useProfileData();

  const [done, setDone] = useState(false);
  const [mode, setMode] = useState<Mode>("select");

  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const [selection, setSelection] = useState<string>("");
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

  console.log("💾 Saved autofill:", savedFlat);

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

  // TODO: UGH REFACTOR SOON
  const validateNow = useCallback(() => {
    const next = validateAll(mainDefs, values, validatorFns);

    const getValMs = (key: string) =>
      coerceAnyDate(values[key] ?? values[key.replace(/-/g, "_")]);

    const coerceISOms = (s?: string) => {
      if (!s) return undefined;
      const ms = Date.parse(s);
      return Number.isFinite(ms) ? ms : undefined;
    };

    const setErr = (key: string, msg: string) => {
      next[key] = msg;
      next[key.replace(/-/g, "_")] = msg; // ensure renderer sees it either way
    };

    // global min (today + 7)
    const todayMid = new Date();
    todayMid.setHours(0, 0, 0, 0);
    const globalMinMs = addDays(todayMid, 7).getTime();

    // defs (support dash/underscore)
    const startDef = mainDefs.find((d) => d.key === "internship-start-date");
    const endDef = mainDefs.find((d) => d.key === "internship-end-date");

    const buildBounds = (def?: FieldDef) => {
      const p = def?.params ?? {};
      const minOffset = Number.isFinite(p.minOffsetDays) ? p.minOffsetDays : 7;
      const maxOffset = Number.isFinite(p.maxOffsetDays)
        ? p.maxOffsetDays
        : undefined;

      const minFromOffsetMs = addDays(todayMid, minOffset).getTime();
      const maxFromOffsetMs =
        maxOffset != null ? addDays(todayMid, maxOffset).getTime() : undefined;

      const minFromISOms = coerceISOms(p.minDateISO);
      const maxFromISOms = coerceISOms(p.maxDateISO);

      // final min = most restrictive (largest)
      const minMs = Math.max(
        ...[globalMinMs, minFromOffsetMs, minFromISOms].filter(
          (n): n is number => typeof n === "number" && Number.isFinite(n),
        ),
      );

      // final max = most restrictive (smallest)
      const maxCandidates = [maxFromOffsetMs, maxFromISOms].filter(
        (n): n is number => typeof n === "number" && Number.isFinite(n),
      );
      const maxMs = maxCandidates.length
        ? Math.min(...maxCandidates)
        : undefined;

      return { minMs, maxMs };
    };

    // START
    if (startDef) {
      const startKey = startDef.key;
      const startMs = getValMs(startKey);
      const { minMs: startMinMs, maxMs: startMaxMs } = buildBounds(startDef);

      if (startMs != null) {
        if (startMs < startMinMs) {
          setErr(
            startKey,
            `Start date must be on or after ${new Date(startMinMs).toLocaleDateString()}.`,
          );
        }
        if (startMaxMs != null && startMs > startMaxMs) {
          setErr(
            startKey,
            `Start date must be on or before ${new Date(startMaxMs).toLocaleDateString()}.`,
          );
        }
      }
    }

    // END
    if (endDef) {
      const endKey = endDef.key;
      const endMs = getValMs(endKey);
      const { minMs: endMinMs, maxMs: endMaxMs } = buildBounds(endDef);

      if (endMs != null) {
        if (endMs < endMinMs) {
          setErr(
            endKey,
            `End date must be on or after ${new Date(endMinMs).toLocaleDateString()}.`,
          );
        }
        if (endMaxMs != null && endMs > endMaxMs) {
          setErr(
            endKey,
            `End date must be on or before ${new Date(endMaxMs).toLocaleDateString()}.`,
          );
        }
      }

      // cross-field end ≥ start
      const startMs = startDef ? getValMs(startDef.key) : undefined;
      if (startMs != null && endMs != null && endMs < startMs) {
        setErr(endKey, "End date must be on or after your start date.");
      }

      // ---- HOURS MINIMUM (blocking) ----
      const hoursRaw = values["internship-hours"];
      const hoursNum = Number(hoursRaw);

      if (Number.isFinite(hoursNum)) {
        if (hoursNum < 8) {
          const msg = "Internship hours must be at least 8.";
          next["internship-hours"] = msg;
        }
      }

      // ---- HOURS vs DATE RANGE (blocking) ----
      const startMsFinal = startDef ? getValMs(startDef.key) : undefined;
      const endMsFinal = endDef ? getValMs(endDef.key) : undefined;

      if (
        Number.isFinite(hoursNum) &&
        hoursNum > 0 &&
        startMsFinal != null &&
        endMsFinal != null
      ) {
        const weekdays = countWeekdaysInclusive(startMsFinal, endMsFinal);
        const maxPossibleHours = weekdays * 8; // 8h/day, Mon–Fri

        if (hoursNum > maxPossibleHours) {
          const msg = `With your selected dates, you can complete at most ${maxPossibleHours} hours (8h/day, Mon–Fri). Reduce hours or extend your date range.`;
          next["internship-hours"] = msg;
        }
      }
    }

    // ---- TIME PARSE + DAILY 8H MIN (blocking) ----
    const parseHHMM = (s?: unknown): number | undefined => {
      if (typeof s !== "string") return undefined;
      const m = s.trim().match(/^(\d{1,2}):(\d{2})$/);
      if (!m) return undefined;
      const hh = Number(m[1]),
        mm = Number(m[2]);
      if (
        !Number.isFinite(hh) ||
        !Number.isFinite(mm) ||
        hh < 0 ||
        hh > 23 ||
        mm < 0 ||
        mm > 59
      ) {
        return undefined;
      }
      return hh * 60 + mm; // minutes since midnight
    };

    // support dash/underscore keys
    const startTimeRaw = values["internship-start-time"];
    const endTimeRaw = values["internship-end-time"];

    const startMin = parseHHMM(startTimeRaw);
    const endMin = parseHHMM(endTimeRaw);

    // only validate if both times present & valid
    if (startMin != null && endMin != null) {
      if (endMin <= startMin) {
        const msg = "End time must be after start time.";
        next["internship-end-time"] = msg;
      } else {
        const minutes = endMin - startMin;
        const hours = minutes / 60;
        if (hours < 8) {
          const msg = "Daily schedule must be at least 8 hours.";
          next["internship-end-time"] = msg;
        }
      }
    }

    // ---- HOURS vs DATE RANGE (blocking) ----
    const hoursRaw = values["internship-hours"];
    const hoursNum = Number(hoursRaw);

    const startMsFinal = startDef ? getValMs(startDef.key) : undefined;
    const endMsFinal = endDef ? getValMs(endDef.key) : undefined;

    if (
      Number.isFinite(hoursNum) &&
      hoursNum > 0 &&
      startMsFinal != null &&
      endMsFinal != null &&
      startMin != null &&
      endMin != null &&
      endMin > startMin
    ) {
      // compute daily hours from time range, then cap to 8 because the policy is "assume 8 hours/day"
      const dailyHours = Math.min(8, (endMin - startMin) / 60);
      const weekdays = countWeekdaysInclusive(startMsFinal, endMsFinal);
      const maxPossibleHours = weekdays * dailyHours;

      if (hoursNum > maxPossibleHours) {
        const msg = `With your selected dates and daily schedule, you can complete at most ${Math.floor(maxPossibleHours)} hours. Reduce hours or extend your date range.`;
        next["internship-hours"] = msg;
      }
    }

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

      // TODO: Remove if hard coded derivations not needed anymore
      const collegeName =
        to_college_name(finalFlat["student-college"] ?? null, null) ??
        undefined;

      const finalWithDerived = buildDerivedValues(finalFlat, { collegeName });

      console.log("🧾 Submitting flat payload:", finalWithDerived);

      try {
        setBusy(true);

        await update.mutateAsync({ internship_moa_fields: finalFlat });

        const route = withEsign ? "submitSignedForm" : "submitPendingForm";
        await UserService[route]({
          formName,
          values: finalWithDerived, // TODO: switch to `finalFlat` if derivations not needed anymore
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
      mode,
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
        <GenerateButtons
          formKey={formName}
          handleSubmit={handleSubmit}
          busy={busy}
        />
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
      return coerceAnyDate(raw);
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

function countWeekdaysInclusive(startMs: number, endMs: number): number {
  if (endMs < startMs) return 0;
  let d = new Date(startMs);
  d.setHours(0, 0, 0, 0);
  const end = new Date(endMs);
  end.setHours(0, 0, 0, 0);
  let count = 0;
  while (d.getTime() <= end.getTime()) {
    const day = d.getDay(); // 0=Sun .. 6=Sat
    if (day !== 0 && day !== 6) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}
