"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { JobHead, SuperListingBadge } from "@/components/shared/jobs";
import { Job, SavedJob } from "@/lib/db/db.types";
import { SaveJobButton } from "@/components/features/student/job/save-job-button";
import { cn } from "@/lib/utils";

export type SavedJobItem = SavedJob & Partial<Job>;

export const SavedJobCard = ({ savedJob }: { savedJob: SavedJobItem }) => {
  const router = useRouter();
  const job = savedJob.job ?? savedJob.jobs ?? savedJob;
  const jobRecord = job as Record<string, unknown> | undefined;
  const challengeTitleFromJoin = (
    jobRecord?.jobs_challenge as { title?: unknown } | undefined
  )?.title;
  const superListingTitle = job.challenge?.title?.trim();
  const isSuperListing =
    Boolean(superListingTitle) ||
    (typeof challengeTitleFromJoin === "string" &&
      challengeTitleFromJoin.trim().length > 0);
  const isUnavailable = job?.is_active === false || job?.is_deleted === true;
  const jobId = job.id ?? savedJob.job_id ?? savedJob.id;
  const canOpenListing = !!jobId && !isUnavailable;
  const saveButtonJob = {
    ...(job ?? {}),
    id: jobId ?? "",
  } as Job;

  return (
    <Card
      className={cn(
        canOpenListing &&
          !isSuperListing &&
          "cursor-pointer transition-colors hover:bg-primary/5 hover:border-primary/20",
        canOpenListing &&
          isSuperListing &&
          "cursor-pointer hover:ring-1 hover:ring-primary/20",
        isSuperListing &&
          "super-card relative isolate overflow-hidden bg-[radial-gradient(ellipse_at_top_left,rgba(254,240,138,0.5),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(251,146,60,0.18),transparent_35%),linear-gradient(150deg,rgba(255,251,235,1)_0%,rgba(255,255,255,1)_45%,rgba(254,243,199,0.98)_100%)]",
      )}
      onClick={() => {
        if (!canOpenListing) return;
        void router.push(`/search/${jobId}`);
      }}
      role={canOpenListing ? "button" : undefined}
      tabIndex={canOpenListing ? 0 : undefined}
      onKeyDown={(event) => {
        if (!canOpenListing) return;
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        void router.push(`/search/${jobId}`);
      }}
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {isSuperListing && <SuperListingBadge compact className="w-fit" />}
            {isUnavailable && (
              <Badge type="destructive">Job no longer available.</Badge>
            )}
          </div>
        </div>
        <JobHead title={job.title} employer={job.employer?.name} />
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mt-2 mb-4">
          {job.description}
        </p>
      </div>
      <div className="flex items-center gap-2 justify-end">
        {jobId ? (
          <div
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <SaveJobButton job={saveButtonJob} />
          </div>
        ) : null}
        {canOpenListing && (
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-[0.33em] bg-primary/5 text-primary/80">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
    </Card>
  );
};
