"use client";

import { PageContainer } from "@betterinternship/components/page-header";
import JobTabs from "@/components/features/hire/dashboard/JobTabs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Loader } from "@/components/ui/loader";
import { JobLoadError } from "@/components/features/hire/job-load-error";
import JobHeader from "@/components/features/hire/dashboard/JobHeader";
import { useJob, useProfile } from "@/hooks/use-employer-api";
import { Clock } from "lucide-react";

function ManageContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const { job, loading, error, notFound, updateJob, refetch } = useJob(jobId);
  const profile = useProfile();

  if (loading) {
    return (
      <PageContainer>
        <Loader>Loading job...</Loader>
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
    <>
      <JobHeader job={job} onJobUpdate={updateJob} backHref="/dashboard" />
      <PageContainer>
        {profile.data?.is_verified === false ? (
          <div className="flex flex-col items-center justify-center text-center gap-2 py-24 text-gray-500">
            <Clock className="w-8 h-8 mb-2" />
            <p className="font-medium text-gray-700">
              Applications will appear here once we verify your account.
            </p>
            <p className="text-sm">
              Your listings aren't visible to students yet.
            </p>
          </div>
        ) : (
          <JobTabs selectedJob={job} onJobUpdate={updateJob} />
        )}
      </PageContainer>
    </>
  );
}

export default function Manage() {
  return (
    <Suspense>
      <ManageContent />
    </Suspense>
  );
}
