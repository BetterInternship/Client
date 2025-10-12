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

export const isISO = (s?: string | null) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
export const fmtISO = (s?: string | null) =>
  isISO(s)
    ? new Date(`${s}T00:00:00Z`).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not provided";

