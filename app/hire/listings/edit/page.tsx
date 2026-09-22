"use client";

import EditJobPage, {
  type EditJobPageHandle,
} from "@/components/features/hire/listings/editJob";
import JobHeader from "@/components/features/hire/dashboard/JobHeader";
import { Loader } from "@/components/ui/loader";
import { JobLoadError } from "@/components/features/hire/job-load-error";
import { PageContainer } from "@betterinternship/components/page-header";
import { Button } from "@betterinternship/components";
import { useModalRegistry } from "@/components/modals/modal-registry";
import { useJob } from "@/hooks/use-employer-api";
import { useAppContext } from "@/lib/ctx-app";
import { JobService } from "@/lib/api/services";
import { UpdateJobChallengeListingPayload } from "@/lib/db/db.types";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";

export default function EditJobPageRoute() {
  return (
    <Suspense>
      <EditJobPageRouteContent></EditJobPageRouteContent>
    </Suspense>
  );
}

function EditJobPageRouteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const { job, loading, error, notFound, refetch } = useJob(jobId);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isMissing, setIsMissing] = useState(true);
  const { isMobile } = useAppContext();
  const modalRegistry = useModalRegistry();
  const editJobRef = useRef<EditJobPageHandle>(null);

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

  const openDiscardModal = () =>
    modalRegistry.discardEdit.open({
      onConfirm: () => router.push(`/dashboard/manage?jobId=${jobId}`),
    });

  const desktopEditActions = (
    <div className="flex gap-3 items-center">
      <Button variant="outline" onClick={openDiscardModal} disabled={saving}>
        Cancel
      </Button>
      <Button
        disabled={saving || isMissing}
        onClick={() => editJobRef.current?.submit()}
        className="flex items-center"
      >
        {saving ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Editing...
          </>
        ) : (
          "Save Edits"
        )}
      </Button>
    </div>
  );

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
      <JobHeader
        job={job}
        backHref={`/dashboard/manage?jobId=${jobId}`}
        applicantActions={isMobile ? undefined : desktopEditActions}
      />
      <EditJobPage
        key={job.id}
        ref={editJobRef}
        job={job}
        is_editing={isEditing}
        set_is_editing={setIsEditing}
        saving={saving}
        update_job={updateJob}
        onMissingChange={setIsMissing}
      />
    </>
  );
}
