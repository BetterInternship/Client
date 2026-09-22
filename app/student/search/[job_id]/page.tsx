"use client";

import React, { useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, TriangleAlert, X } from "lucide-react";
import {
  Button,
  PageContainer,
  Card,
  StatusNotice,
} from "@betterinternship/components";
import { useProfileData, useJobData } from "@/lib/api/student.data.api";
import { useModalRef } from "@/hooks/use-modal";
import { useMobile } from "@/hooks/use-mobile";
import { Loader } from "@/components/ui/loader";
import { JobDetails } from "@/components/shared/jobs";
import { ApplySuccessModal } from "@/components/modals/ApplySuccessModal";
import { PageError } from "@/components/ui/error";
import { SaveJobButton } from "@/components/features/student/job/save-job-button";
import { ApplyToJobButton } from "@/components/features/student/job/apply-to-job-button";
import { useApplicationActions } from "@/lib/api/student.actions.api";
import { ShareJobButton } from "@/components/features/student/job/share-job-button";
import type { ApplyPayload } from "@/components/modals/components/ApplyModal";
import { toast } from "sonner";

/**
 * The individual job page.
 * Allows viewing unlisted jobs.
 */
export default function JobPage() {
  const router = useRouter();
  const params = useParams();
  const { job_id } = params;
  const job = useJobData(job_id as string);
  const [isActionsSheetOpen, setIsActionsSheetOpen] = useState(false);
  const { isMobile } = useMobile();
  const applySuccessModalRef = useModalRef();
  const applicationActions = useApplicationActions();

  const profile = useProfileData();

  const handleApply = useCallback(
    async ({ resumeId }: ApplyPayload) => {
      if (!job.data?.id || !resumeId) return;

      const response = await applicationActions.create.mutateAsync({
        job_id: job.data.id,
        resume_id: resumeId,
      });

      if (response.message) {
        toast.error(response.message);
        return;
      }

      applySuccessModalRef.current?.open();
    },
    [applicationActions.create, job.data],
  );

  if (job.error)
    return (
      <PageError title="Failed to load job" description={job.error.message} />
    );

  if (!job || (!job.data && !job.isPending)) {
    return (
      <div className="h-full flex justify-center px-2">
        <div className="flex flex-col justify-center">
          <StatusNotice
            icon={TriangleAlert}
            title="Job does not exist."
            description="If you are coming from a valid link, it is possible that the job was deleted by the employer."
            action={
              <Button
                size="md"
                variant="link"
                onClick={() => router.back()}
                className="flex items-center gap-2 px-3 py-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            }
            variant="destructive"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop and Mobile Layout */}
      <div className="flex-1 flex">
        {job.isPending ? (
          <Loader>Loading job details...</Loader>
        ) : (
          <div className="relative w-full flex flex-col">
            <div className="w-full bg-white border-b border-gray-200 shrink-0 fixed">
              <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex flex-wrap items-center gap-3">
                    {job.data && <ShareJobButton job={job.data} />}
                    {job.data && !job.data.hibernating && (
                      <>
                        <SaveJobButton job={job.data} />
                        <ApplyToJobButton
                          profile={profile.data}
                          job={job.data}
                          onApply={handleApply}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {job.data?.id && (
              <PageContainer>
                {/* Job Header Card */}
                <Card className="bg-white border border-gray-200 rounded-[0.33em] p-4 sm:p-6 mt-14 overflow-hidden">
                  {/* Job Details Grid */}
                  <JobDetails
                    user={{
                      github_link: profile.data?.github_link ?? null,
                      portfolio_link: profile.data?.portfolio_link ?? null,
                    }}
                    job={job.data}
                  />
                </Card>
              </PageContainer>
            )}

            {isMobile && isActionsSheetOpen && (
              <div className="absolute inset-0 z-40">
                <button
                  type="button"
                  aria-label="Close actions"
                  className="absolute inset-0 bg-black/40"
                  onClick={() => setIsActionsSheetOpen(false)}
                />
                <div className="absolute inset-x-0 bottom-0 z-50 rounded-t-[0.33em] border-t bg-white p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] shadow-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold text-gray-900">
                        Job actions
                      </p>
                      <p className="text-sm text-gray-500">
                        Quick actions for this listing.
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full"
                      aria-label="Close actions"
                      onClick={() => setIsActionsSheetOpen(false)}
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                  {job.data?.id && (
                    <ShareJobButton
                      job={job.data}
                      className="w-full justify-start"
                      onOpen={() => setIsActionsSheetOpen(false)}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ApplySuccessModal job={job.data} ref={applySuccessModalRef} />
    </>
  );
}
