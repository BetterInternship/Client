import { useMemo, type MouseEvent } from "react";
import { toast } from "sonner";
import { Bell, BellRing, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Job } from "@/lib/db/db.types";
import { useAuthContext } from "@/lib/ctx-auth";
import { useJobStatus, useWaitlistsData } from "@/lib/api/student.data.api";
import { useWaitlistActions } from "@/lib/api/student.actions.api";

/**
 * CTA that toggles the student's waitlist ("job alert") membership on a
 * hibernating listing. Students only ever see "alert" copy; "waitlist" stays
 * the internal/API name (Docs/plans/HIBERNATING_LISTINGS_IMPLEMENTATION_PLAN.md §1/§7.2).
 * Replaces ApplyToJobButton in action rows/bottom bars.
 *
 * @component
 */
export const ListingAlertButton = ({
  job,
  className,
  size = "md",
  verbose = false,
}: {
  job: Job;
  className?: string;
  size?: "md" | "lg";
  verbose?: boolean;
}) => {
  const auth = useAuthContext();
  const jobs = useJobStatus();
  const waitlists = useWaitlistsData();
  const waitlistActions = useWaitlistActions();

  const applied = useMemo(() => !!jobs.isJobApplied(job.id!), [jobs, job.id]);
  const onAlert = waitlists.isWaitlisted(job.id);
  const pending =
    waitlistActions.join.isPending || waitlistActions.leave.isPending;

  const handleToggle = async (event: MouseEvent) => {
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

  if (applied) {
    return (
      <Button disabled scheme="supportive" size={size} className={className}>
        <CheckCircle className="w-4 h-4" />
        Applied
      </Button>
    );
  }

  return (
    <Button
      variant={onAlert ? "outline" : undefined}
      scheme={onAlert ? "supportive" : "primary"}
      size={size}
      disabled={pending}
      onClick={(event) => void handleToggle(event)}
      className={className}
    >
      {onAlert ? (
        <BellRing className="w-4 h-4" />
      ) : verbose ? (
        <span aria-hidden>🔔</span>
      ) : (
        <Bell className="w-4 h-4" />
      )}
      {onAlert
        ? "Alert set"
        : verbose
          ? "Get an alert when it's back"
          : "Get an alert"}
    </Button>
  );
};
