const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000;

export interface ManilaWeek {
  /** Sunday 00:00 Manila time, as a real UTC instant. */
  start: Date;
  /** Saturday 00:00 Manila time, as a real UTC instant. */
  end: Date;
  /** "Sep 27 – Oct 3, 2026" */
  label: string;
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
  };
}
