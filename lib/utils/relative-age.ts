/**
 * Age label for a Top page card, from jobs.last_activated_at so a reopened
 * listing counts as fresh — the same field marketplace ordering uses.
 *
 * Deliberately fuzzy (Docs/plans/TOP_PAGES_STATIC_GENERATION_PLAN.md D9): a
 * Top page is rendered once and served from cache for days, so an exact "3
 * days ago" would be wrong by the time most people read it. These three
 * buckets stay true for far longer than a page stays cached. Wording is
 * provisional (plan O4).
 */
export function formatListingAge(
  date: string | Date | null | undefined,
): string {
  if (!date) return "";
  const then = new Date(date).getTime();
  if (Number.isNaN(then)) return "";

  const days = Math.floor((Date.now() - then) / (24 * 60 * 60 * 1000));

  if (days < 14) return "Posted recently";
  if (days < 60) return "Posted a few weeks ago";
  return "Posted a while ago";
}
