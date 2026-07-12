import { useMemo } from "react";
import { toast } from "sonner";
import { Bell, BellRing, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Job } from "@/lib/db/db.types";
import { useAuthContext } from "@/lib/ctx-auth";
import { useJobsData, useWaitlistsData } from "@/lib/api/student.data.api";
import { useWaitlistActions } from "@/lib/api/student.actions.api";

/**
 * Compact CTA that replaces ApplyToJobButton wherever a listing is
 * hibernating — toggles the student's waitlist ("job alert") membership.
 * Students only ever see "alert" copy; "waitlist" stays the internal/API name
 * (Docs/plans/HIBERNATING_LISTINGS_IMPLEMENTATION_PLAN.md §1/§7.2).
 *
 * @component
 */
export const ListingAlertButton = ({
  job,
  className,
}: {
  job: Job;
  className?: string;
}) => {
  const auth = useAuthContext();
  const jobs = useJobsData();
  const waitlists = useWaitlistsData();
  const waitlistActions = useWaitlistActions();

  const applied = useMemo(() => !!jobs.isJobApplied(job.id!), [jobs, job.id]);
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
      onClick={() => void handleToggle()}
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
