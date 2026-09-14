"use client";

import { PageContainer } from "@betterinternship/components/page-header";
import JobHeader from "@/components/features/hire/dashboard/JobHeader";
import JobDetailsPage from "@/components/features/hire/listings/jobDetails";
import { Loader } from "@/components/ui/loader";
import { JobLoadError } from "@/components/features/hire/job-load-error";
import { useJob } from "@/hooks/use-employer-api";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function JobDetailsPageRoute() {
  return (
    <Suspense>
      <JobDetailsPageRouteContent></JobDetailsPageRouteContent>
    </Suspense>
  );
}

function JobDetailsPageRouteContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const { job, loading, error, notFound, updateJob, refetch } = useJob(jobId);

  if (loading) {
    return (
      <PageContainer>
        <Loader>Loading listing information...</Loader>
      </PageContainer>
    );
  }

  if (error || notFound || !job) {
    return (
      <PageContainer>
        <JobLoadError
          error={error}
          notFound={notFound}
          onRetry={() => void refetch()}
        />
      </PageContainer>
    );
  }

  return (
    <div className="flex-1 flex justify-center">
      <div className="w-full h-full">
        <JobHeader
          job={job}
          onJobUpdate={updateJob}
          backHref={`/dashboard/manage?jobId=${jobId}`}
        />
        <div className="flex-1 overflow-auto pt-4 px-2 sm:px-8">
          <JobDetailsPage job={job} />
        </div>
      </div>
    </div>
  );
}
