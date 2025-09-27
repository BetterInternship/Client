"use client";

import React, { useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, Clipboard, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProfile, useApplications, useJob } from "@/lib/api/student.api";
import { useAuthContext } from "@/lib/ctx-auth";
import { useDbRefs } from "@/lib/db/use-refs";
import { useModal, useModalRef } from "@/hooks/use-modal";
import ReactMarkdown from "react-markdown";
import { Loader } from "@/components/ui/loader";
import {
  EmployerMOA,
  JobType,
  JobSalary,
  JobMode,
  JobHead,
  JobApplicationRequirements,
} from "@/components/shared/jobs";
import { Card } from "@/components/ui/card";
import { useGlobalModal } from "@/components/providers/ModalProvider";
import { useQueryClient } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { ApplySuccessModal } from "@/components/modals/ApplySuccessModal";
import { PageError } from "@/components/ui/error";
import { SaveJobButton } from "@/components/features/student/job/save-job-button";
import { ApplyToJobButton } from "@/components/features/student/job/apply-to-job-button";

/**
 * The individual job page.
 * Allows viewing unlisted jobs.
 */
export default function JobPage() {
  const router = useRouter();
  const params = useParams();
  const { job_id } = params;
  const job = useJob(job_id as string);
  const successModalRef = useModalRef();

  const {
    open: openApplicationConfirmationModal,
    close: closeApplicationConfirmationModal,
    Modal: ApplicationConfirmationModal,
  } = useModal("application-confirmation-modal");

  const profile = useProfile();
  const { universities } = useDbRefs();
  const applications = useApplications();
  const textarea_ref = useRef<HTMLTextAreaElement>(null);

  const handleDirectApplication = async () => {
    if (!job.data) return;
    if (job.data?.require_cover_letter && !textarea_ref.current?.value.trim()) {
      alert("A cover letter is required to apply for this job.");
      return;
    }
    await applications
      .create({
        job_id: job.data.id ?? "",
        cover_letter: textarea_ref.current?.value ?? "",
      })
      .then((response) => {
        if (applications.createError)
          return alert(applications.createError.message);
        if (response?.message) return alert(response.message);
        successModalRef.current?.open();
      });
  };

  if (job.error) {
    return (
      <PageError title="Failed to load job" description={job.error.message} />
    );
  }

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
                        openAppModal={openApplicationConfirmationModal}
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
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1 max-w-full">
                        <JobHead
                          title={job.data.title}
                          employer={job.data.employer?.name}
                          size="3"
                        />
                        <p className="text-gray-500 text-sm">
                          Listed on{" "}
                          {job.data.created_at
                            ? new Date(job.data.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )
                            : ""}
                        </p>
                      </div>
                    </div>
                    {/* Job Details Grid */}
                    <div className="flex flex-wrap gap-2">
                      <EmployerMOA
                        employer_id={job.data.employer_id}
                        university_id={universities[0]?.id}
                      />
                      <JobType type={job.data.type} />
                      <JobSalary
                        salary={job.data.salary}
                        salary_freq={job.data.salary_freq}
                      />
                      <JobMode mode={job.data.mode} />
                    </div>

                    <div className="border-t border-gray-200 my-8"></div>

                    <h2 className="text-2xl text-gray-700 mb-6 flex items-center gap-3">
                      Description
                    </h2>
                    <div className="prose max-w-none text-gray-700 leading-relaxed">
                      <div className="text-base leading-7">
                        <ReactMarkdown>
                          {job.data.description || "No description provided."}
                        </ReactMarkdown>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 my-8"></div>
                    <h2 className="text-2xl text-gray-700 mb-6 flex items-center gap-3">
                      Requirements
                    </h2>

                    <JobApplicationRequirements job={job.data} />

                    <div className="prose max-w-none text-gray-700 leading-relaxed">
                      <div className="text-base leading-7">
                        {job.data.requirements}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Spacing */}
                  <div className="h-16"></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ApplicationConfirmationModal>
        <div className="max-w-lg mx-auto p-6 max-h-[60vh] overflow-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <Clipboard className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Ready to Apply?
            </h2>
            <p className="text-gray-600 leading-relaxed">
              You're applying for{" "}
              <span className="font-semibold text-gray-900">
                {job.data?.title}
              </span>
              {job.data?.employer?.name && (
                <>
                  {" "}
                  at{" "}
                  <span className="font-semibold text-gray-900">
                    {job.data?.employer.name}
                  </span>
                </>
              )}
            </p>
          </div>

          {/* Cover Letter */}
          <div className="mb-6">
            {(job.data?.require_cover_letter ?? true) && (
              <div className="space-y-3">
                <Textarea
                  ref={textarea_ref}
                  placeholder={`Dear Hiring Manager,

  I am excited to apply for this position because...

  Best regards,
  [Your name]`}
                  className="w-full h-20 p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none text-sm overflow-y-auto"
                  maxLength={500}
                />
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 flex items-center gap-1">
                    💡 <span>Mention specific skills and enthusiasm</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                closeApplicationConfirmationModal();
              }}
              className="flex-1 h-12 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                closeApplicationConfirmationModal();
                handleDirectApplication();
              }}
              className="flex-1 h-12 transition-all duration-200"
            >
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Submit Application
              </div>
            </Button>
          </div>
        </div>
      </ApplicationConfirmationModal>

      <ApplySuccessModal job={job.data} ref={successModalRef} />
    </>
  );
}
