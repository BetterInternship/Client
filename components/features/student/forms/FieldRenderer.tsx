"use client";

import {
  FormDropdown,
  FormDatePicker,
  TimeInputNative,
  FormInput,
  FormCheckbox,
} from "@/components/EditForm";
import z from "zod";
import { UserService } from "@/lib/api/services";
import { useQuery } from "@tanstack/react-query";

type FieldType =
  | "text"
  | "number"
  | "select"
  | "date"
  | "time"
  | "signature"
  | "reference";
export type Section =
  | "student"
  | "entity"
  | "university"
  | "internship"
  | "student-guardian";

type Option = { value: string; label: string };

export type FieldDef = {
  id: string;
  key: string; // db key (used to store in formData)
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  helper?: string;
  maxLength?: number;
  options?: Option[]; // for select
  validators: z.ZodTypeAny[];
  section?: Section;
  value?: string;
  params?: Record<string, any>;
};

export function FieldRenderer({
  def,
  value = def.value ?? "",
  onChange,
  error,
  showError,
  allValues,
}: {
  def: FieldDef;
  value: string;
  onChange: (v: any) => void;
  error?: string;
  showError?: boolean;
  allValues?: Record<string, any>;
}) {
  // placeholder and error
  const Note = () => {
    if (showError && !!error) {
      return <p className="text-xs text-rose-600 mt-1">{error}</p>;
    }
    if (def.helper) {
      return <p className="text-xs text-muted-foreground mt-1">{def.helper}</p>;
    }
    return null;
  };

  // [custom] for items that need to be queried from backend
  if (def.type === "reference") {
    if (def.key === "entity-id") {
      const { data } = useQuery({
        queryKey: ["entities", "list"],
        queryFn: async () => await UserService.getEntityList(),
        refetchOnMount: "always",
      });

      const companies: Array<{ id: string; name: string }> = (
        data?.employers ?? []
      ).map((c) => ({
        id: String(c.id),
        name: c.display_name,
      }));

      return (
        <div className="space-y-1.5">
          <FormDropdown
            label={def.label}
            required
            value={value}
            options={companies}
            setter={(v) => onChange(String(v ?? ""))}
            className="w-full"
          />
          <Note />
        </div>
      );
    }
  }

  // dropdown
  if (def.type === "select") {
    const options = (def.options ?? []).map((o) => ({
      id: o.value,
      name: o.label,
    }));
    return (
      <div className="space-y-1.5">
        <FormDropdown
          label={def.label}
          required
          value={value}
          options={options}
          setter={(v) => onChange(String(v ?? ""))}
          className="w-full"
        />
        <Note />
      </div>
    );
  }

  // date
  if (def.type === "date") {
    // Normalize keys (your DB sometimes uses dashes; code often uses underscores)
    const key = String(def.key);
    const isStart =
      key === "internship-start-date" || key === "internship_start_date";
    const isEnd =
      key === "internship-end-date" || key === "internship_end_date";

    // ——— Params you can set in DB ———
    // params example (any subset is fine):
    // {
    //   "minOffsetDays": 7,             // earliest = today + 7
    //   "maxOffsetDays": 180,           // latest  = today + 180
    //   "minDateISO": "2026-01-05",     // absolute earliest
    //   "maxDateISO": "2026-04-11",     // absolute latest
    //   "notBeforeField": "internship-start-date" // end >= start
    // }
    const p = def.params ?? {};

    // Defaults: if you don't set anything, start/end both default to +7 days
    const defaultMinOffset = isStart || isEnd ? 7 : undefined;

    // Build min/max from params
    const today = new Date();
    const todayMid = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const minFromOffset =
      (Number.isFinite(p.minOffsetDays) ? p.minOffsetDays : defaultMinOffset) !=
      null
        ? addDays(todayMid, (p.minOffsetDays ?? defaultMinOffset) as number)
        : undefined;

    const maxFromOffset = Number.isFinite(p.maxOffsetDays)
      ? addDays(todayMid, p.maxOffsetDays)
      : undefined;

    const minFromISO = coerceISO(p.minDateISO);
    const maxFromISO = coerceISO(p.maxDateISO);

    // Cross-field: notBeforeField (e.g., end >= start)
    const notBeforeKey: string | undefined =
      p.notBeforeField ?? (isEnd ? "internship-start-date" : undefined); // sensible default for end-date
    const otherValMs =
      notBeforeKey && allValues
        ? coerceAnyDate(
            allValues[notBeforeKey] ??
              allValues[notBeforeKey.replace(/-/g, "_")],
          )
        : undefined;
    const minFromOther = otherValMs ? new Date(otherValMs) : undefined;

    // Final min/max (take the most restrictive min and most restrictive max)
    const minDate = [minFromOffset, minFromISO, minFromOther]
      .filter(Boolean)
      .sort((a: Date, b: Date) => a.getTime() - b.getTime())[0] as
      | Date
      | undefined;

    const maxDate = [maxFromOffset, maxFromISO]
      .filter(Boolean)
      .sort((a: Date, b: Date) => b.getTime() - a.getTime())[0] as
      | Date
      | undefined;

    // Build disabledDays for your FormDatePicker
    const disabledDays: Array<{ before?: Date; after?: Date }> = [];
    if (minDate || maxDate) {
      disabledDays.push({ before: minDate, after: maxDate });
    }

    const dateMs =
      typeof value === "number"
        ? value
        : typeof value === "string"
          ? coerceAnyDate(value)
          : undefined;

    // Optional: clamp bad seeded values (keeps UX clean if saved value violates new rules)
    const clampedMs =
      dateMs != null ? clampDateMs(dateMs, minDate, maxDate) : undefined;

    const displayMs = clampedMs ?? dateMs;

    return (
      <div className="space-y-1.5">
        <FormDatePicker
          label={def.label}
          required
          date={displayMs}
          setter={(nextMs) => onChange(nextMs ?? 0)}
          className="w-full"
          contentClassName="z-[1100]"
          placeholder="Select date"
          autoClose
          disabledDays={disabledDays}
          format={(d) =>
            d.toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "2-digit",
            })
          }
        />
        <Note />
      </div>
    );
  }

  // time
  if (def.type === "time") {
    return (
      <div className="space-y-1.5">
        <TimeInputNative
          label={def.label}
          value={value} // "HH:MM"
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          onChange={(v) => onChange(v?.toString() ?? "")}
          required
          helper={def.helper}
        />
        <Note />
      </div>
    );
  }

  // signature (checkbox)
  const asBool = (v: any) => v === true;

  if (def.type === "signature" || def.type === "checkbox") {
    const checked = asBool(value);
    return (
      <div className="space-y-1.5">
        <FormCheckbox
          label={def.label}
          checked={checked}
          setter={(c) => onChange(Boolean(c))}
          sentence={def.helper}
          required
        />
      </div>
    );
  }

  // input
  const inputMode = def.type === "number" ? "numeric" : undefined;
  const sanitizeNumber = (s: string) =>
    s
      .replace(/[^\d.]/g, "") // keep digits and dot
      .replace(/(\..*)\./g, "$1"); // single dot only

  return (
    <div className="space-y-1.5">
      <FormInput
        label={def.label}
        required
        value={value ?? ""}
        setter={(v) => {
          if (def.type === "number") {
            const next = sanitizeNumber(String(v ?? ""));
            onChange(next);
          } else {
            onChange(String(v ?? ""));
          }
        }}
        type="text"
        inputMode={inputMode}
        placeholder={def.placeholder}
        maxLength={def.maxLength}
        className="w-full"
      />
      <Note />
    </div>
  );
}

// helpers
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

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function coerceISO(s?: string) {
  if (!s) return undefined;
  const ms = Date.parse(s);
  return Number.isFinite(ms) ? new Date(ms) : undefined;
}
function clampDateMs(ms: number, min?: Date, max?: Date) {
  if (min && ms < min.getTime()) return min.getTime();
  if (max && ms > max.getTime()) return max.getTime();
  return ms;
}
