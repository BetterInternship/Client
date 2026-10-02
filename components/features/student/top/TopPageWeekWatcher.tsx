"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { usePostHog } from "@posthog/react";
import { StatusNotice } from "@betterinternship/components/status-notice";
import { classifyWeekParam } from "@/lib/utils/manila-week";

const WEEK_PARAM_MAX_LENGTH = 32;

/** The Saturday that ends the week starting on `weekKey` (a "YYYY-MM-DD" Sunday). */
function weekEndKey(weekKey: string) {
  const end = new Date(`${weekKey}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 6);
  return end.toISOString().slice(0, 10);
}

/**
 * Owns everything on a Top page that depends on `?week=`
 * (Docs/plans/TOP_PAGES_WEEK_PARAM_PLAN.md): the old-QR banner and the
 * `top_page_viewed` event. It reads the param in the browser on purpose —
 * reading `searchParams` in the server page would make the route dynamic and
 * throw away its 60s `revalidate`. `weekKey` is the server's current week, so
 * a student's wrong device clock can't flip a fresh QR to "old".
 *
 * Must be rendered inside a <Suspense> (useSearchParams on a cached route).
 */
export function TopPageWeekWatcher({
  page,
  weekKey,
  jobCount,
}: {
  page: { id: string; slug: string };
  weekKey: string;
  jobCount: number;
}) {
  const posthog = usePostHog();
  const searchParams = useSearchParams();
  const rawWeek = searchParams.get("week");
  const status = classifyWeekParam(rawWeek, {
    key: weekKey,
    endKey: weekEndKey(weekKey),
  });

  // Once per mount: StrictMode's double effect and re-renders must not
  // double-count a visit.
  const sentRef = useRef(false);
  useEffect(() => {
    if (sentRef.current) return;
    sentRef.current = true;

    posthog.capture("top_page_viewed", {
      top_page_id: page.id,
      top_page_slug: page.slug,
      week_param: rawWeek ? rawWeek.slice(0, WEEK_PARAM_MAX_LENGTH) : null,
      week_status: status,
      current_week: weekKey,
      listing_count: jobCount,
    });
  }, [posthog, page.id, page.slug, rawWeek, status, weekKey, jobCount]);

  if (status !== "stale") return null;

  return (
    <div className="mb-4">
      <StatusNotice
        icon={TriangleAlert}
        variant="warning"
        title="The QR you scanned is old."
        description="The company and listings shown here may have changed already."
      />
    </div>
  );
}
