import { toast } from "sonner";
import { Bell, BellOff, CheckCircle2, Clock, HeartCrack } from "lucide-react";
import { Button } from "@betterinternship/components";
import { StatusNotice } from "@betterinternship/components/status-notice";
import { Job } from "@/lib/db/db.types";
import { cn } from "@betterinternship/components";
import { useAuthContext } from "@/lib/ctx-auth";
import { useJobStatus, useWaitlistsData } from "@/lib/api/student.data.api";
import { useWaitlistActions } from "@/lib/api/student.actions.api";

/**
 * The hero banner shown on a hibernating listing's details pane (desktop) /
 * modal (mobile) — the one emotional accent on the student side (🚨 appears
 * exactly once, here). Sits above the listing details, which stay fully
 * visible — they're what let a student decide whether the listing merits an
 * alert. Copy is the single source of truth in
 * Docs/plans/HIBERNATING_LISTINGS_IMPLEMENTATION_PLAN.md §7.1.
 *
 * Built on top of `StatusNotice` (`@betterinternship/components`). Its
 * published API has no slot for a crossfading full-bleed background, so the
 * hero variant below is a best-effort fit: it swaps a single background
 * image per state via `className` instead of animating between two layered
 * images. If that crossfade needs to come back, it means extending
 * `StatusNotice` itself (e.g. a `background` prop) in Package.Components and
 * publishing a new version — this file alone can't get it back.
 *
 * @component
 */
export const HibernatingListingBanner = ({
  job,
  className,
}: {
  job: Job;
  className?: string;
}) => {
  const auth = useAuthContext();
  const jobs = useJobStatus();
  const waitlists = useWaitlistsData();
  const waitlistActions = useWaitlistActions();

  if (!job.hibernating) return null;

  const applied = !!jobs.isJobApplied(job.id!);
  const onAlert = waitlists.isWaitlisted(job.id);
  const pending =
    waitlistActions.join.isPending || waitlistActions.leave.isPending;

  const handleToggle = async () => {
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

  if (applied) {
    return (
      <StatusNotice
        icon={CheckCircle2}
        variant="primary"
        title="You've already applied"
        description="Your application is still visible to the employer."
      />
    );
  }

  return (
    <StatusNotice
      title={onAlert ? "Alert set." : "You just missed it."}
      description={
        onAlert
          ? "We'll email you if this listing reopens."
          : "This internship is no longer accepting applicants."
      }
      icon={onAlert ? Bell : HeartCrack}
      variant={onAlert ? "primary" : "warning"}
      action={
        <Button
          disabled={pending}
          onClick={() => void handleToggle()}
          className="shrink-0 rounded-[0.33em]"
          variant={onAlert ? "outline" : "default"}
          scheme={onAlert ? "default" : "supportive"}
        >
          {onAlert ? (
            "Turn off alert"
          ) : (
            <span className="animate-jitter flex gap-1 items-center">
              <Bell />
              Get an alert when it&apos;s back
            </span>
          )}
        </Button>
      }
    />
  );
};
