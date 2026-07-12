import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Job } from "@/lib/db/db.types";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/lib/ctx-auth";
import { useJobsData, useWaitlistsData } from "@/lib/api/student.data.api";
import { useWaitlistActions } from "@/lib/api/student.actions.api";

/**
 * The hero banner shown on a hibernating listing's details pane (desktop) /
 * modal (mobile) — the one emotional accent on the student side (😭 appears
 * exactly once, here). Sits above the listing details, which stay fully
 * visible — they're what let a student decide whether the listing merits an
 * alert. Copy is the single source of truth in
 * Docs/plans/HIBERNATING_LISTINGS_IMPLEMENTATION_PLAN.md §7.1.
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
  const jobs = useJobsData();
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

  return (
    <div
      className={cn(
        "rounded-[0.33em] border border-gray-200 bg-gray-50 px-5 py-4",
        className,
      )}
    >
      {applied ? (
        <p className="text-sm text-gray-700">
          You&apos;ve already applied — your application is still visible to the
          employer.
        </p>
      ) : onAlert ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
            <CheckCircle2 className="h-4 w-4 text-supportive" />
            Alert set — we&apos;ll email you if this listing reopens.
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => void handleToggle()}
          >
            Turn off alert
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-base font-semibold text-gray-900">
            😭 You just missed it.
          </p>
          <p className="text-sm text-gray-700">
            This internship is no longer accepting applicants.
          </p>
          <Button
            scheme="primary"
            size="md"
            disabled={pending}
            onClick={() => void handleToggle()}
          >
            Get an alert when it&apos;s back
          </Button>
          <p className="text-xs text-gray-500">
            We&apos;ll email you if this listing starts accepting applications
            again. You can turn the alert off anytime.
          </p>
        </div>
      )}
    </div>
  );
};
