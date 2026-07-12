import { useMemo, type MouseEvent } from "react";
import { toast } from "sonner";
import { Bell, BellRing, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Job } from "@/lib/db/db.types";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/lib/ctx-auth";
import { useJobsData, useWaitlistsData } from "@/lib/api/student.data.api";
import { useWaitlistActions } from "@/lib/api/student.actions.api";

/**
 * CTA that toggles the student's waitlist ("job alert") membership on a
 * hibernating listing. Students only ever see "alert" copy; "waitlist" stays
 * the internal/API name (Docs/plans/HIBERNATING_LISTINGS_IMPLEMENTATION_PLAN.md §1/§7.2).
 *
 * Two variants:
 * - "compact" (default): replaces ApplyToJobButton in action rows/bottom bars.
 * - "card-footer": a full-width strip merged to the bottom of a search-list
 *   card, joining/leaving directly without navigating to the listing —
 *   `stopPropagation` keeps this from also triggering the card's own
 *   click-to-open-details handler.
 *
 * @component
 */
export const ListingAlertButton = ({
  job,
  className,
  variant = "compact",
  roundedClassName = "rounded-b-[0.33em]",
}: {
  job: Job;
  className?: string;
  variant?: "compact" | "card-footer";
  roundedClassName?: string;
}) => {
  const auth = useAuthContext();
  const jobs = useJobsData();
  const waitlists = useWaitlistsData();
  const waitlistActions = useWaitlistActions();

  const applied = useMemo(() => !!jobs.isJobApplied(job.id!), [jobs, job.id]);
  const onAlert = waitlists.isWaitlisted(job.id);
  const pending =
    waitlistActions.join.isPending || waitlistActions.leave.isPending;

  const handleToggle = async (event: MouseEvent) => {
    // Card-footer buttons sit inside a clickable card whose own onClick
    // opens the listing — this action is meant to stand alone instead.
    event.stopPropagation();

    if (!auth.isAuthenticated()) {
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
      return;
    }
    if (!job.id) return;

    try {
      const response = onAlert
        ? await waitlistActions.leave.mutateAsync(job.id)
        : await waitlistActions.join.mutateAsync(job.id);
      if (response.message) toast.error(response.message);
    } catch {
      toast.error("Couldn't update your alert. Please try again.");
    }
  };

  if (variant === "card-footer") {
    if (applied) {
      return (
        <div
          className={cn(
            "flex w-full items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-500 bg-gray-100",
            roundedClassName,
            className,
          )}
        >
          <CheckCircle className="w-4 h-4" />
          You&apos;ve already applied
        </div>
      );
    }

    return (
      <button
        type="button"
        disabled={pending}
        onClick={(event) => void handleToggle(event)}
        className={cn(
          "flex w-full items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer disabled:cursor-default disabled:opacity-70",
          onAlert
            ? "bg-supportive/15 text-supportive hover:bg-supportive/25"
            : "bg-gray-100 text-primary hover:bg-gray-200",
          roundedClassName,
          className,
        )}
      >
        <span aria-hidden>🔔</span>
        {onAlert
          ? pending
            ? "Turning off..."
            : "Alert set — click to turn off"
          : pending
            ? "Joining..."
            : "Click here to get notified when it opens again"}
      </button>
    );
  }

  if (applied) {
    return (
      <Button disabled scheme="supportive" size="md" className={className}>
        <CheckCircle className="w-4 h-4" />
        Applied
      </Button>
    );
  }

  return (
    <Button
      variant={onAlert ? "outline" : undefined}
      scheme={onAlert ? "supportive" : "primary"}
      size="md"
      disabled={pending}
      onClick={(event) => void handleToggle(event)}
      className={className}
    >
      {onAlert ? (
        <BellRing className="w-4 h-4" />
      ) : (
        <Bell className="w-4 h-4" />
      )}
      {onAlert ? "Alert set" : "Get an alert"}
    </Button>
  );
};
