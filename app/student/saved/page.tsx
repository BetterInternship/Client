"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Heart } from "lucide-react";
import { useJobsData } from "@/lib/api/student.data.api";
import { useAuthContext } from "@/lib/ctx-auth";
import { Loader } from "@/components/ui/loader";
import { Card } from "@/components/ui/card";
import { JobHead, SuperListingBadge } from "@/components/shared/jobs";
import { Job, SavedJob } from "@/lib/db/db.types";
import { HeaderIcon, HeaderText } from "@/components/ui/text";
import { Separator } from "@/components/ui/separator";
import { PageError } from "@/components/ui/error";
import { SaveJobButton } from "@/components/features/student/job/save-job-button";
import { cn } from "@/lib/utils";

type SavedJobItem = SavedJob & Partial<Job>;

export default function SavedJobsPage() {
  const { isAuthenticated, redirectIfNotLoggedIn } = useAuthContext();
  const jobs = useJobsData();
  const savedJobs = React.useMemo(
    () =>
      [...(jobs.savedJobs as SavedJobItem[])].sort((a, b) => {
        const firstSavedAt =
          (a as { saved_at?: string | null }).saved_at ??
          a.created_at ??
          a.job?.created_at ??
          a.jobs?.created_at ??
          "";
        const secondSavedAt =
          (b as { saved_at?: string | null }).saved_at ??
          b.created_at ??
          b.job?.created_at ??
          b.jobs?.created_at ??
          "";
        return (
          new Date(secondSavedAt).getTime() - new Date(firstSavedAt).getTime()
        );
      }),
    [jobs.savedJobs],
  );

  redirectIfNotLoggedIn();

  return (
    <div className="h-full overflow-y-auto py-6 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <div>
            <div className="flex flex-row items-center gap-3 mb-2">
              <HeaderIcon icon={Heart} />
              <HeaderText>Saved Jobs</HeaderText>
            </div>
            <Badge>{savedJobs.length} saved</Badge>
          </div>
        </div>
        <Separator className="mt-4 mb-8" />

        {jobs.isPending || !isAuthenticated() ? (
          <Loader>Loading saved jobs...</Loader>
        ) : jobs.error ? (
          <PageError
            title="Failed to load saved jobs."
            description={jobs.error.message}
          />
        ) : savedJobs.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <Card className="max-w-md m-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No saved jobs yet
              </h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Save jobs by clicking the heart icon on job listings to see them
                here.
              </p>
              <Link href="/search">
                <Button className="bg-primary hover:bg-primary/90">
                  Browse Jobs
                </Button>
              </Link>
            </Card>
          </div>
        ) : (
          <div className="space-y-3">
            {savedJobs.map((savedJob, index) => (
              <SavedJobCard
                key={savedJob.id ?? savedJob.job_id ?? `saved-job-${index}`}
                savedJob={savedJob}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const SavedJobCard = ({ savedJob }: { savedJob: SavedJobItem }) => {
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
          <div className="flex items-center gap-2">
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
        </div>
        <JobHead title={job.title} employer={job.employer?.name} />
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mt-2 mb-4">
          {job.description}
        </p>
      </div>
    </Card>
  );
};
