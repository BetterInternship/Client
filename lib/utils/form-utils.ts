import { toWords } from "number-to-words";
import { format } from "date-fns";

/** e.g., "College of Computer Studies" -> "Computer Studies"
 *  also handles "School of ..." / "Faculty of ...", case-insensitive.
 */
function shortCollegeName(name: string | null | undefined): string | undefined {
  if (!name) return undefined;
  const cleaned = name
    .replace(/^\s*(college|school|faculty)\s+of\s+/i, "") // strip prefix
    .replace(/\s+/g, " ") // normalize spaces
    .trim();
  return cleaned || undefined;
}

/** Robustly turn unknown -> Date or null (supports ms epoch or ISO-ish strings) */
export function parseToDate(raw: unknown): Date | null {
  if (raw == null) return null;

  if (typeof raw === "number") {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof raw === "string") {
    // try numeric milliseconds first, then Date parse
    const n = Number(raw);
    if (Number.isFinite(n)) {
      const d = new Date(n);
      return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

export function toMMDDYYYY(d: Date | null): string {
  if (!d) return "";
  return format(d, "MMddyyyy"); // e.g., 01052025
}

/** Convert "four hundred eighty-six" -> "Four Hundred Eighty Six" */
function toTitleCaseWords(s: string): string {
  if (!s) return s;
  return s
    .replace(/-/g, " ") // drop hyphens
    .replace(/\s+/g, " ") // normalize spaces
    .trim()
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ");
}

/** Add all required derived fields into the payload (returns a new object) */
export function buildDerivedValues(
  values: Record<string, string>,
  opts?: { collegeName?: string | null },
): Record<string, string> {
  const out: Record<string, string> = { ...values };

  // Agreement date (use provided or now)
  const agreement = parseToDate(values["agreement-date"]) ?? new Date();
  const yyyy = agreement.getFullYear();
  const dd = agreement.getDate();

  out["derived-agreement-day"] = String(dd);
  // Full month name (e.g., "January")
  out["derived-agreement-month"] = format(agreement, "LLLL");
  // last two digits of year (00-padded)
  out["derived-agreement-year"] = String(yyyy % 100).padStart(2, "0");

  // College actual name (provided by caller; keep component-resolved)
  if (opts?.collegeName) {
    out["derived-student-college-name"] = opts.collegeName;
  }

  // Internship hours in words -> Title/Camel Case (no hyphens)
  const hours = Number(values["internship-hours"]);
  if (Number.isFinite(hours)) {
    out["derived-internship-hours-words"] = toTitleCaseWords(toWords(hours));
  }

  // Start/End dates
  const start = parseToDate(values["internship-start-date"]);
  const end = parseToDate(values["internship-end-date"]);

  // Long form — "January 11 2025" (no commas/periods)
  out["derived-internship-start-date-long"] = start
    ? format(start, "MMMM d yyyy")
    : "";
  out["derived-internship-end-date-long"] = end
    ? format(end, "MMMM d yyyy")
    : "";

  if (opts?.collegeName) {
    out["derived-student-college-name"] = opts.collegeName;
    const short = shortCollegeName(opts.collegeName);
    if (short) out["derived-student-college-name-short"] = short;
  }

  return out;
}
