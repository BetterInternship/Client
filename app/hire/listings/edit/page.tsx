"use client";

import EditJobPage from "@/components/features/hire/listings/editJob";
import JobHeader from "@/components/features/hire/dashboard/JobHeader";
import { Loader } from "@/components/ui/loader";
import { JobLoadError } from "@/components/features/hire/job-load-error";
import { PageContainer } from "@betterinternship/components/page-header";
import { useJob } from "@/hooks/use-employer-api";
import { JobService } from "@/lib/api/services";
import { UpdateJobChallengeListingPayload } from "@/lib/db/db.types";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

export default function EditJobPageRoute() {
  return (
    <Suspense>
      <EditJobPageRouteContent></EditJobPageRouteContent>
    </Suspense>
  );
}

function EditJobPageRouteContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const { job, loading, error, notFound, refetch } = useJob(jobId);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const updateJob = async (
    job_id: string,
    job: UpdateJobChallengeListingPayload,
  ): Promise<{ success: boolean }> => {
    try {
      setSaving(true);
      console.log("Sending job data:", JSON.stringify(job, null, 2));
      const response = await JobService.updateJob(job_id, job);
      console.log("API response:", response);
      return {
        success: response?.success || false,
      };
    } catch (error: any) {
      console.error("Server action error details:", error);
      return { success: false };
    } finally {
      setSaving(false);
    }
  };

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
    <>
      <JobHeader job={job} backHref={`/dashboard/manage?jobId=${jobId}`} />
      <EditJobPage
        key={job.id}
        job={job}
        is_editing={isEditing}
        set_is_editing={setIsEditing}
        saving={saving}
        update_job={updateJob}
      />
    </>
  );
}
