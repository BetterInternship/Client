import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Job } from "@/lib/db/db.types";
import { cn } from "@/lib/utils";
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
      <div
        className={cn("bg-white border-b border-gray-200 px-5 py-4", className)}
      >
        <p className="text-sm text-gray-700">
          You&apos;ve already applied — your application is still visible to the
          employer.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 bg-[url('/student/images/paused-banner-bg.png')] bg-cover bg-center transition-opacity duration-700 ease-in-out pointer-events-none",
          onAlert ? "opacity-0" : "opacity-100",
        )}
      />
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 bg-[url('/student/images/alert-banner-bg.png')] bg-cover bg-center transition-opacity duration-700 ease-in-out pointer-events-none",
          onAlert ? "opacity-100" : "opacity-0",
        )}
      />
      <div className="relative z-10 flex flex-row px-6 py-5">
        <div className="flex flex-col sm:items-start items-center sm:justify-between gap-4 w-full">
          <div className="flex items-stretch gap-3 w-full">
            <div
              className={cn(
                "hidden sm:block relative aspect-square shrink-0 overflow-hidden rounded-full m-1",
                onAlert ? "bg-green-100 opacity-75" : "bg-sky-200 opacity-75",
              )}
            >
              <img
                src={
                  onAlert
                    ? "/student/images/clock.png"
                    : "/student/images/alert.png"
                }
                alt=""
                className="absolute inset-0 h-full w-full object-contain scale-75"
              />
            </div>
            <div className="w-full">
              <p className="text-3xl font-bold text-white tracking-tight leading-snug">
                {onAlert ? "Alert set." : "You just missed it."}
              </p>
              <p
                className={cn(
                  "text-md",
                  onAlert ? "text-green-100" : "text-blue-100",
                )}
              >
                {onAlert
                  ? "We'll email you if this listing reopens."
                  : "This internship is no longer accepting applicants."}
              </p>
            </div>
          </div>
          <Button
            disabled={pending}
            onClick={() => void handleToggle()}
            size={"lg"}
            className={cn(
              "shrink-0 rounded-[0.33em]  text-gray-600 text-lg tracking-tight",
              onAlert
                ? "bg-green-50 hover:bg-gray-200"
                : "bg-sky-50 hover:bg-gray-200",
            )}
          >
            {onAlert ? (
              "🔕 Turn off alert"
            ) : (
              <span className="inline-block animate-jitter">
                🔔 Get an alert when it&apos;s back
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
