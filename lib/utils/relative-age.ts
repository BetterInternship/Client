/**
 * Age label for a Top page card (plan D14), from jobs.last_activated_at so a
 * reopened listing counts as fresh — the same field marketplace ordering
 * uses. Under 1 day is "Today"; under a week is "X days ago"; under 4 weeks
 * is "X weeks ago"; from 4 weeks on it's just "months ago", no number.
 */
export function formatListingAge(
  date: string | Date | null | undefined,
): string {
  if (!date) return "";
  const then = new Date(date).getTime();
  if (Number.isNaN(then)) return "";

  const days = Math.floor((Date.now() - then) / (24 * 60 * 60 * 1000));

  if (days < 1) return "Today";
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  if (days < 28) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }
  return "months ago";
}
