"use client";

import React, { useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, EllipsisVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProfileData, useJobData } from "@/lib/api/student.data.api";
import { useModalRef } from "@/hooks/use-modal";
import { useMobile } from "@/hooks/use-mobile";
import { Loader } from "@/components/ui/loader";
import { JobDetails } from "@/components/shared/jobs";
import { Card } from "@/components/ui/card";
import { ApplySuccessModal } from "@/components/modals/ApplySuccessModal";
import { PageError } from "@/components/ui/error";
import { SaveJobButton } from "@/components/features/student/job/save-job-button";
import { ApplyToJobButton } from "@/components/features/student/job/apply-to-job-button";
import { useApplicationActions } from "@/lib/api/student.actions.api";
import { ShareJobButton } from "@/components/features/student/job/share-job-button";
import { useAuthContext } from "@/lib/ctx-auth";

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
  const { isAuthenticated } = useAuthContext();

  const handleApply = useCallback(async () => {
    if (!job.data?.id) return;

    const response = await applicationActions.create.mutateAsync({
      job_id: job.data.id,
      resume_id: "",
      cover_letter: "",
    });

    if (response.message) {
      alert(response.message);
      return;
    }

    applySuccessModalRef.current?.open();
  }, [applicationActions.create, job.data]);

  if (job.error)
    return (
      <PageError title="Failed to load job" description={job.error.message} />
    );

  if (!job.data && !job.isPending) {
    return (
      <div className="h-screen bg-white flex justify-center py-6">
        <div className="flex flex-col justify-start items-start gap-4">
          <Button
            size="md"
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Card>
            <div className="text-left max-w-prose">
              <p className="font-bold mb-1">Job does not exist.</p>
              <p className="text-gray-700 text-xs">
                If you are coming from a valid link, it is possible that the job
                was deleted by the employer.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop and Mobile Layout */}
      <div className="flex-1 flex overflow-hidden max-h-full">
        {job.isPending ? (
          <Loader>Loading job details...</Loader>
        ) : (
          <div className="relative w-full flex flex-col h-full bg-gray-50">
            {isMobile ? (
              <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b px-4 pb-2 pt-5">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="h-8 w-8 p-0 -ml-2 hover:bg-gray-100 rounded-full"
                    aria-label="Back"
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                    aria-label="More actions"
                    onClick={() => setIsActionsSheetOpen(true)}
                  >
                    <EllipsisVertical className="h-5 w-5 text-gray-500" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
                <div className="max-w-4xl mx-auto px-6 py-4">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      onClick={() => router.back()}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </Button>
                    {job.data && (
                      <div className="flex flex-wrap items-center gap-3">
                        <ShareJobButton id={job.data.id ?? ""} />
                        <SaveJobButton job={job.data} />
                        <ApplyToJobButton
                          profile={profile.data}
                          job={job.data}
                          onApply={handleApply}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {job.data?.id && (
              <div className="flex-1 overflow-y-auto">
                <div
                  className={
                    isMobile
                      ? "max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-[calc(env(safe-area-inset-bottom)+96px)]"
                      : "max-w-4xl mx-auto px-6 py-8"
                  }
                >
                  {/* Job Header Card */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-3 px-4">
                    {/* Job Details Grid */}
                    <JobDetails
                      user={{
                        github_link: profile.data?.github_link ?? null,
                        portfolio_link: profile.data?.portfolio_link ?? null,
                      }}
                      job={job.data}
                      isAuthenticated={isAuthenticated()}
                    />
                  </div>
                </div>
              </div>
            )}

            {isMobile && job.data && (
              <div className="absolute bottom-0 left-0 right-0 z-30 bg-white border-t p-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
                <div className="max-w-4xl mx-auto flex gap-3">
                  <SaveJobButton job={job.data} />
                  <ApplyToJobButton
                    profile={profile.data}
                    job={job.data}
                    onApply={handleApply}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {isMobile && isActionsSheetOpen && (
              <div className="absolute inset-0 z-40">
                <button
                  type="button"
                  aria-label="Close actions"
                  className="absolute inset-0 bg-black/40"
                  onClick={() => setIsActionsSheetOpen(false)}
                />
                <div className="absolute inset-x-0 bottom-0 z-50 rounded-t-2xl border-t bg-white p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] shadow-xl">
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
                      id={job.data.id}
                      className="w-full justify-start"
                      onCopied={() => setIsActionsSheetOpen(false)}
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
