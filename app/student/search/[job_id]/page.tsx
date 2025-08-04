"use client";

import type React from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Heart,
  CheckCircle,
  Clipboard,
  AlertTriangle,
  User,
  ArrowLeft,
  File,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useSavedJobs,
  useProfile,
  useApplications,
  useJob,
} from "@/lib/api/student.api";
import { useAuthContext } from "@/lib/ctx-auth";
import { Job, PublicUser } from "@/lib/db/db.types";
import { useDbRefs } from "@/lib/db/use-refs";
import { useModal } from "@/hooks/use-modal";
import { cn } from "@/lib/utils";
import {
  getMissingProfileFields,
  isCompleteProfile,
  profileQualifiesFor,
} from "@/lib/utils/user-utils";
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

/**
 * The individual job page.
 * Allows viewing unlisted jobs.
 */
export default function JobPage() {
  const router = useRouter();
  const params = useParams();
  const { job_id } = params;
  const job = useJob(job_id as string);
  const { isAuthenticated } = useAuthContext();
  const {
    open: open_application_modal,
    close: close_application_modal,
    Modal: ApplicationModal,
  } = useModal("application-modal");
  const {
    open: open_success_modal,
    close: close_success_modal,
    Modal: SuccessModal,
  } = useModal("success-modal");
  const {
    open: open_incomplete_profile_modal,
    close: close_incomplete_profile_modal,
    Modal: IncompleteProfileModal,
  } = useModal("incomplete-profile-modal");
  const profile = useProfile();
  const { universities } = useDbRefs();
  const savedJobs = useSavedJobs();
  const applications = useApplications();

  const handleSave = async (job: Job) => {
    if (!isAuthenticated()) {
      window.location.href = "/login";
      return;
    }
    await savedJobs.toggle(job.id ?? "");
  };

  const handleApply = () => {
    if (!isAuthenticated()) {
      window.location.href = "/login";
      return;
    }

    // Check if already applied
    const applicationStatus = applications.appliedJob(job.data?.id ?? "");
    if (applicationStatus) {
      alert("You have already applied to this job!");
      return;
    }

    // Check if profile is complete
    if (!isCompleteProfile(profile.data)) {
      open_incomplete_profile_modal();
      return;
    }

    // Check if job requirements are met
    if (!profileQualifiesFor(profile.data, job.data)) {
      open_incomplete_profile_modal();
      return;
    }

    // If everything is complete, apply directly
    handleDirectApplication();
  };

  const handleDirectApplication = async () => {
    if (!job.data) return;

    try {
      const { success } = await applications.create({
        job_id: job.data.id ?? "",
        cover_letter: "",
      });
      if (success) open_success_modal();
      else alert("Could not apply to job.");
    } catch (error) {
      console.error("Failed to submit application:", error);
      alert("Failed to submit application. Please try again.");
    } finally {
    }
  };

  if (job.error) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Failed to load job: {job.error.message}
          </p>
        </div>
      </div>
    );
  }

  if (!job.data && !job.isPending) {
    return (
      <div className="h-screen bg-white flex justify-center py-6">
        <div className="flex flex-col justify-start items-start gap-4">
          <Button
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
                      <Button
                        variant="outline"
                        onClick={() => handleSave(job.data!)}
                        scheme={
                          savedJobs.isJobSaved(job.data.id ?? "")
                            ? "destructive"
                            : "default"
                        }
                      >
                        <Heart
                          className={cn(
                            "w-4 h-4",
                            savedJobs.isJobSaved(job.data.id ?? "")
                              ? "fill-current"
                              : ""
                          )}
                        />
                        {savedJobs.isJobSaved(job.data.id ?? "")
                          ? savedJobs.isToggling
                            ? "Unsaving..."
                            : "Saved"
                          : savedJobs.isToggling
                          ? "Saving..."
                          : "Save"}
                      </Button>

                      <Button
                        disabled={applications.appliedJob(job.data.id ?? "")}
                        scheme={
                          applications.appliedJob(job.data.id ?? "")
                            ? "supportive"
                            : "primary"
                        }
                        onClick={() =>
                          !applications.appliedJob(job.data?.id ?? "") &&
                          handleApply()
                        }
                      >
                        {applications.appliedJob(job.data.id ?? "") && (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        {applications.appliedJob(job.data.id ?? "")
                          ? "Applied"
                          : "Apply Now"}
                      </Button>
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

      {/* Application Modal - Only for Missing Job Requirements */}
      <ApplicationModal>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Apply to {job.data?.title}</h2>
        </div>

        {/* Missing Job Requirements Warning */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-orange-800 mb-2">
                Missing Job Requirements
              </h3>
              <p className="text-sm text-orange-700 mb-3">
                This job requires additional profile information:
              </p>
              <ul className="text-sm text-orange-700 list-disc list-inside mb-4">
                {Object.keys(
                  getMissingProfileFields(profile.data as PublicUser).labels
                ).map((field, index) => (
                  <li key={index}>{field}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Update Profile Button */}
        <Button
          onClick={() => {
            close_application_modal();
            router.push("/profile");
          }}
          size="md"
          scheme="supportive"
          className="h-12"
        >
          <User className="w-4 h-4 mr-2" />
          Update Profile
        </Button>
      </ApplicationModal>

      {/* Success Modal */}
      <SuccessModal>
        {/* Header with close button */}
        <div className="flex justify-between items-center p-6 pb-0"></div>

        {/* Content */}
        <div className="px-6 pb-8 text-center">
          {/* Success Animation */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.div
              className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.6,
                type: "spring",
                bounce: 0.5,
              }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.3 }}
              >
                <CheckCircle className="w-10 h-10 text-green-600" />
              </motion.div>
            </motion.div>

            <motion.h2
              className="text-2xl font-bold text-gray-800 mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              Application Sent!
            </motion.h2>

            <motion.p
              className="text-gray-600 mb-6 leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              Your application for{" "}
              <span className="font-semibold max-w-prose text-gray-800">
                {job.data?.title}
              </span>{" "}
              has been successfully submitted.
            </motion.p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            <Button
              onClick={() => {
                close_success_modal();
                router.push("/applications");
              }}
            >
              <Clipboard className="w-4 h-4 mr-2" />
              View My Applications
            </Button>
          </motion.div>
        </div>
      </SuccessModal>

      {/* Incomplete Profile Modal */}
      <IncompleteProfileModal>
        <div className="p-6">
          {(() => {
            // Get missing fields from profile
            let { missing, labels } = getMissingProfileFields(
              profile.data as PublicUser
            );

            // Add job-specific requirements if needed
            if (
              job.data?.require_github &&
              !profile.data?.github_link?.trim()
            ) {
              if (!missing.includes("github_link")) missing.push("github_link");
              labels.github_link = "GitHub Profile";
            }
            if (
              job.data?.require_portfolio &&
              !profile.data?.portfolio_link?.trim()
            ) {
              if (!missing.includes("portfolio_link"))
                missing.push("portfolio_link");
              labels.portfolio_link = "Portfolio Link";
            }

            const missingCount = missing.length;

            return (
              <>
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-orange-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Complete Your Profile
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    You need to complete your profile before applying to jobs.
                    {missingCount === 1
                      ? "There is 1 required field missing."
                      : `There are ${missingCount} required fields missing.`}
                  </p>
                </div>

                {/* Missing Fields List */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Missing Information
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {missing.map((field) => (
                      <div
                        key={field}
                        className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg"
                      >
                        <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                        <span className="text-sm font-medium text-orange-800">
                          {labels[field]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => close_incomplete_profile_modal()}
                    className="flex-1 h-12 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl font-medium transition-all duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      close_incomplete_profile_modal();
                      router.push("/profile");
                    }}
                    className="flex-1 h-12 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <User className="w-4 h-4" />
                      Complete Profile
                    </div>
                  </Button>
                </div>
              </>
            );
          })()}
        </div>
      </IncompleteProfileModal>
    </>
  );
}
