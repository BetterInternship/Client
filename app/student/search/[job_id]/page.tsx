"use client";

import React, { useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProfileData, useJobData } from "@/lib/api/student.data.api";
import { useDbRefs } from "@/lib/db/use-refs";
import { useModalRef } from "@/hooks/use-modal";
import ReactMarkdown from "react-markdown";
import { Loader } from "@/components/ui/loader";
import {
  EmployerMOA,
  JobType,
  JobSalary,
  JobMode,
  JobHead,
  JobApplicationRequirements,
  JobDetails,
} from "@/components/shared/jobs";
import { Card } from "@/components/ui/card";
import { ApplySuccessModal } from "@/components/modals/ApplySuccessModal";
import { PageError } from "@/components/ui/error";
import { SaveJobButton } from "@/components/features/student/job/save-job-button";
import { ApplyToJobButton } from "@/components/features/student/job/apply-to-job-button";
import { ApplyConfirmModal } from "@/components/modals/ApplyConfirmModal";
import { applyToJob } from "@/lib/application";
import { useApplicationActions } from "@/lib/api/student.actions.api";

/**
 * The individual job page.
 * Allows viewing unlisted jobs.
 */
export default function JobPage() {
  const router = useRouter();
  const params = useParams();
  const { job_id } = params;
  const job = useJobData(job_id as string);
  const applyConfirmModalRef = useModalRef();
  const successModalRef = useModalRef();
  const applySuccessModalRef = useModalRef();
  const applicationActions = useApplicationActions();

  const profile = useProfileData();
  const { universities } = useDbRefs();

  const goProfile = useCallback(() => {
    applyConfirmModalRef.current?.close();
    router.push("/profile");
  }, [applyConfirmModalRef, router]);

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
          <div className="w-full flex flex-col h-full bg-gray-50">
            {/* Enhanced Header with Back Navigation */}
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
                    <div className="flex items-center gap-3">
                      <SaveJobButton job={job.data} />
                      <ApplyToJobButton
                        profile={profile.data}
                        job={job.data}
                        openAppModal={() =>
                          applyConfirmModalRef.current?.open()
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {job.data?.id && (
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-6 py-8">
                  {/* Job Header Card */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-3 px-4">
                    {/* Job Details Grid */}
                    <JobDetails
                      user={{
                        github_link: profile.data?.github_link ?? null,
                        portfolio_link: profile.data?.portfolio_link ?? null,
                      }}
                      job={job.data}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ApplySuccessModal job={job.data} ref={applySuccessModalRef} />
      <ApplyConfirmModal
        ref={applyConfirmModalRef}
        job={job.data}
        onClose={() => applyConfirmModalRef.current?.close()}
        onAddNow={goProfile}
        onSubmit={async (text: string) => {
          applyConfirmModalRef.current?.close();
          await applyToJob(applicationActions, job.data, text).then(
            (response) => {
              if (!response.success) return alert(response.message);
              applySuccessModalRef.current?.open();
            },
          );
        }}
      />

      <ApplySuccessModal job={job.data} ref={successModalRef} />
    </>
  );
}
