const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000;

export interface ManilaWeek {
  /** Sunday 00:00 Manila time, as a real UTC instant. */
  start: Date;
  /** Saturday 00:00 Manila time, as a real UTC instant. */
  end: Date;
  /** "Sep 27 – Oct 3, 2026" */
  label: string;
  /** The Sunday that starts the week, as a Manila calendar date: "2026-09-27". */
  key: string;
  /** The Saturday that ends the week, as a Manila calendar date: "2026-10-03". */
  endKey: string;
}

const monthDayFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const dayFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  timeZone: "UTC",
});
const yearFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  timeZone: "UTC",
});

/**
 * The current Sunday–Saturday week in Manila time (plan D9) — always the
 * live week, never "the week of the last save". Uses a fixed UTC+8 offset
 * (the Philippines observes no DST) instead of an Intl timezone lookup, so
 * this behaves identically in every server runtime: shift the instant by
 * +8h, then read its UTC fields as if they were Manila's local fields.
 */
export function currentManilaWeek(now: Date = new Date()): ManilaWeek {
  const shifted = new Date(now.getTime() + MANILA_OFFSET_MS);
  const manilaDayOfWeek = shifted.getUTCDay(); // 0 = Sunday

  const manilaMidnight = Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate(),
  );
  const startShifted = new Date(
    manilaMidnight - manilaDayOfWeek * 24 * 60 * 60 * 1000,
  );
  const endShifted = new Date(startShifted.getTime() + 6 * 24 * 60 * 60 * 1000);

  const label =
    startShifted.getUTCMonth() === endShifted.getUTCMonth()
      ? `${monthDayFormatter.format(startShifted)} – ${dayFormatter.format(endShifted)}, ${yearFormatter.format(endShifted)}`
      : `${monthDayFormatter.format(startShifted)} – ${monthDayFormatter.format(endShifted)}, ${yearFormatter.format(endShifted)}`;

  return {
    start: new Date(startShifted.getTime() - MANILA_OFFSET_MS),
    end: new Date(endShifted.getTime() - MANILA_OFFSET_MS),
    label,
    // startShifted/endShifted sit at UTC midnight of the Manila calendar date,
    // so their ISO date is the Manila date.
    key: startShifted.toISOString().slice(0, 10),
    endKey: endShifted.toISOString().slice(0, 10),
  };
}

/** The week after `now`'s, for pubmats that are made ahead of time. */
export function nextManilaWeek(now: Date = new Date()): ManilaWeek {
  return currentManilaWeek(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000));
}

export type WeekParamStatus =
  | "none"
  | "invalid"
  | "current"
  | "stale"
  | "future";

const WEEK_PARAM_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Classifies a Top page's `?week=` value (Docs/plans/TOP_PAGES_WEEK_PARAM_PLAN.md
 * D1/D2) against the live week. Only "stale" shows the old-QR banner — a
 * typo ("invalid") or a pubmat scanned before its week starts ("future")
 * must not scare a student. Zero-padded ISO dates compare correctly as strings.
 */
export function classifyWeekParam(
  raw: string | null,
  week: Pick<ManilaWeek, "key" | "endKey">,
): WeekParamStatus {
  if (!raw) return "none";
  if (!WEEK_PARAM_PATTERN.test(raw)) return "invalid";

  // Rejects dates that parse but roll over (2026-02-31 → Mar 3).
  const parsed = new Date(`${raw}T00:00:00Z`);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== raw
  ) {
    return "invalid";
  }

  if (raw < week.key) return "stale";
  if (raw > week.endKey) return "future";
  return "current";
}
