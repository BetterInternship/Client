/**
 * Adds the specified number of days to the date object
 *
 * @param d
 * @param n
 * @returns
 */
export const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

/**
 * Converts iso to unix timestamp
 *
 * @param s
 * @returns
 */
export const coerceISO = (s?: string) => {
  if (!s) return undefined;
  const ms = Date.parse(s);
  return Number.isFinite(ms) ? new Date(ms) : undefined;
};

/**
 * Converts any date (string, date obj) to unix timestamp.
 * // ! we should deprecate this, this is not safe
 *
 * @param raw
 * @returns
 */
export const coerceAnyDate = (raw: unknown): number | undefined => {
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
};

/**
 * Counts the number of weekdays between two dates.
 *
 * @param startMs
 * @param endMs
 * @returns
 */
export const countWeekdaysInclusive = (
  startMs: number,
  endMs: number,
): number => {
  if (endMs < startMs) return 0;
  const d = new Date(startMs);
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
};

/**
 * Clamps date to within the given range
 *
 * @param ms
 * @param min
 * @param max
 * @returns
 */
export const clampDateMs = (ms: number, min?: Date, max?: Date) => {
  if (min && ms < min.getTime()) return min.getTime();
  if (max && ms > max.getTime()) return max.getTime();
  return ms;
};

/**
 * Format a unix timestamp as a simple date format.
 *
 * @param timestamp
 * @returns
 */
export const formatTimestampDate = (timestamp?: number | null) => {
  if (!timestamp) return "-";
  const date = new Date(timestamp);
  return (
    date.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }) +
    ", " +
    String(date.getHours()).padStart(2, "0") +
    ":" +
    String(date.getMinutes()).padStart(2, "0")
  );
};

/**
 * Date formatter.
 *
 * @param dateString
 * @returns
 */
export const formatDate = (dateString?: string | null) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return (
    date.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }) +
    ", " +
    String(date.getHours()).padStart(2, "0") +
    ":" +
    String(date.getMinutes()).padStart(2, "0")
  );
};

/**
 * Return a formatted date string from a UNIX timestamp without the time.
 * @param timestamp Timestamp/date in UNIX timestamp format.
 * @returns
 */
export const formatTimestampDateWithoutTime = (timestamp?: number | null) => {
  if (!timestamp) return "-";
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Return a formatted date string from another timestamp string without the time.
 * @param dateString Timestamp/date in string form.
 */
export const formatDateWithoutTime = (dateString?: string | null) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Date formatter.
 *
 * @param dateString
 * @returns
 */
export const formatMonth = (dateString?: string | null) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
  });
};

/**
 * Time ago formatter
 *
 * @param fromDateString
 * @returns
 */
export const formatTimeAgo = (fromDateString: string) => {
  const from = new Date(fromDateString).getTime();
  const to = new Date().getTime();

  const seconds = Math.floor((to - from) / 1000);

  const intervals = [
    { label: "y", seconds: 31536000 }, // 365 * 24 * 60 * 60
    { label: "mo", seconds: 2592000 }, // 30 * 24 * 60 * 60
    { label: "w", seconds: 604800 }, // 7 * 24 * 60 * 60
    { label: "d", seconds: 86400 }, // 24 * 60 * 60
    { label: "h", seconds: 3600 }, // 60 * 60
    { label: "min", seconds: 60 },
    { label: "s", seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count}${interval.label} ago`;
    }
  }

  return "just now";
};

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

export const isoToMs = (iso?: string | null) => {
  if (!iso || !ISO_RE.test(iso)) return undefined;
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};

export const msToISO = (ms?: number | null) =>
  ms == null ? undefined : new Date(ms).toISOString().slice(0, 10);

export const isISO = (s?: string | null) =>
  !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
export const fmtISO = (s?: string | null) =>
  isISO(s)
    ? new Date(`${s}T00:00:00Z`).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not provided";
