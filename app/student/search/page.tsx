"use client";

import React, { useRef } from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Heart, CheckCircle, Clipboard, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  useJobs,
  useSavedJobs,
  useProfile,
  useApplications,
} from "@/lib/api/student.api";
import { useAuthContext } from "@/lib/ctx-auth";
import { Job } from "@/lib/db/db.types";
import { Paginator } from "@/components/ui/paginator";
import { useAppContext } from "@/lib/ctx-app";
import { useModal, useModalRef } from "@/hooks/use-modal";
import { JobCard, JobDetails, MobileJobCard } from "@/components/shared/jobs";
import { ApplicantModalContent } from "@/components/shared/applicant-modal";
import {
  getMissingProfileFields,
  isCompleteProfile,
} from "@/lib/utils/user-utils";
import { UserService } from "@/lib/api/services";
import { useFile } from "@/hooks/use-file";
import { PDFPreview } from "@/components/shared/pdf-preview";
import { openURL } from "@/lib/utils/url-utils";
import { IncompleteProfileModal } from "@/components/modals/IncompleteProfileModal";
import { ApplySuccessModal } from "@/components/modals/ApplySuccessModal";
import { JobModal } from "@/components/modals/JobModal";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthContext();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [position, setPosition] = useState<string[]>([]);
  const [jobModeFilter, setJobModeFilter] = useState<string[]>([]);
  const [jobWorkloadFilter, setJobWorkloadFilter] = useState<string[]>([]);
  const [jobAllowanceFilter, setJobAllowanceFilter] = useState<string[]>([]);
  const [jobMoaFilter, setJobMoaFilter] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const textarea_ref = useRef<HTMLTextAreaElement>(null);
  const [showCoverLetterInput, setShowCoverLetterInput] = useState(false);

  const {
    open: openApplicationConfirmationModal,
    close: closeApplicationConfirmationModal,
    Modal: ApplicationConfirmationModal,
  } = useModal("application-confirmation-modal");

  const {
    open: openProfilePreviewModal,
    close: closeProfilePreviewModal,
    Modal: ProfilePreviewModal,
  } = useModal("profile-preview-modal");

  const jobModalRef = useModalRef();
  const incompleteModalRef = useModalRef();
  const successModalRef = useModalRef();

  const { open: openResumeModal, Modal: ResumeModal } =
    useModal("resume-modal");

  const { isMobile: is_mobile } = useAppContext();
  const profile = useProfile();

  // Resume URL management for profile preview
  const { url: resumeURL, sync: syncResumeURL } = useFile({
    fetcher: UserService.getMyResumeURL,
    route: "/users/me/resume",
  });

  // API hooks with dynamic filtering based on current filter state
  const jobs_page_size = 10;
  const [jobs_page, setJobsPage] = useState(1);
  const jobs = useJobs({
    search: searchTerm.trim() || undefined,
    position,
    jobModeFilter,
    jobWorkloadFilter,
    jobAllowanceFilter,
    jobMoaFilter,
  });

  // Get paginated jobs directly from getJobsPage
  const jobsPage = jobs.getJobsPage({ page: jobs_page, limit: jobs_page_size });
  const savedJobs = useSavedJobs();
  const applications = useApplications();

  // Initialize search term from URL
  useEffect(() => {
    const query = searchParams.get("query") || "";
    const position = searchParams.get("position")?.split(",") || [];
    const jobAllowance = searchParams.get("allowance")?.split(",") || [];
    const jobWorkload = searchParams.get("workload")?.split(",") || [];
    const jobMode = searchParams.get("mode")?.split(",") || [];
    const jobMoa = searchParams.get("moa")?.split(",") || [];

    setPosition(position);
    setJobAllowanceFilter(jobAllowance);
    setJobWorkloadFilter(jobWorkload);
    setJobModeFilter(jobMode);
    setJobMoaFilter(jobMoa);
    setSearchTerm(query);
  }, [searchParams]);

  // Reset to page 1 when filters or search term change
  useEffect(() => {
    setJobsPage(1);
  }, [searchTerm, jobMoaFilter]);

  // Set first job as selected when jobs load
  useEffect(() => {
    const jobId = searchParams.get("jobId");

    if (jobId && jobsPage.length > 0) {
      const targetJob = jobsPage.find((job) => job.id === jobId);
      if (targetJob && targetJob.id !== selectedJob?.id) {
        setSelectedJob(targetJob);
      }
    } else if (jobsPage.length > 0 && !selectedJob?.id) {
      setSelectedJob(jobsPage[0]);
    }
  }, [jobsPage.length, searchParams]);

  const handleSave = async (job: Job) => {
    if (!isAuthenticated()) {
      window.location.href = "/login";
      return;
    }
    await savedJobs.toggle(job.id ?? "");
  };

  const handleApply = () => {
    if (!isAuthenticated()) {
      console.log("Not authenticated, redirecting to login");
      window.location.href = "/login";
      return;
    }

    // Check if already applied
    const applicationStatus = applications.appliedJob(selectedJob?.id ?? "");
    if (applicationStatus) {
      console.log("Already applied to this job");
      alert("You have already applied to this job!");
      return;
    }

    if (
      !isCompleteProfile(profile.data) ||
      (selectedJob?.require_github &&
        (!profile.data?.github_link || profile.data.github_link === "")) ||
      (selectedJob?.require_portfolio &&
        (!profile.data?.portfolio_link || profile.data.portfolio_link === ""))
    ) {
      incompleteModalRef.current?.open();
      return;
    }

    // If profile is complete, show confirmation modal
    openApplicationConfirmationModal();
  };

  const handleDirectApplication = async () => {
    if (!selectedJob) return;

    if (
      selectedJob?.require_cover_letter &&
      !textarea_ref.current?.value.trim()
    ) {
      alert("A cover letter is required to apply for this job.");
      return;
    }

    await applications
      .create({
        job_id: selectedJob.id ?? "",
        cover_letter: textarea_ref.current?.value ?? "",
      })
      .then(() => {
        if (applications.createError) alert(applications.createError.message);
        else successModalRef.current?.open();
      });
  };

  const handleJobCardClick = (job: Job) => {
    setSelectedJob(job);
    if (is_mobile) jobModalRef.current?.open();
  };

  if (jobs.error) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Failed to load jobs: {jobs.error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop and Mobile Layout */}
      <div className="flex-1 flex overflow-hidden max-h-full">
        {jobs.isPending ? (
          <div className="w-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading jobs...</p>
            </div>
          </div>
        ) : is_mobile ? (
          <div className="w-full flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              {jobsPage.length ? (
                <div className="space-y-4">
                  {jobsPage.map((job) => (
                    <MobileJobCard
                      key={job.id}
                      job={job}
                      on_click={() => handleJobCardClick(job)}
                    />
                  ))}
                </div>
              ) : (
                <div>
                  <p className="p-4">No jobs found.</p>
                </div>
              )}

              {/* Mobile Paginator */}
              <div className="mt-6">
                <Paginator
                  totalItems={jobs.filteredJobs.length}
                  itemsPerPage={jobs_page_size}
                  onPageChange={(page) => setJobsPage(page)}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Layout - Split View */
          <>
            {/* Job List */}
            <div className="w-1/3 border-r overflow-x-hidden overflow-y-auto p-6">
              {/* Desktop Search Bar */}
              {jobsPage.length ? (
                <div className="space-y-3">
                  {jobsPage.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      selected={selectedJob?.id === job.id}
                      on_click={() => handleJobCardClick(job)}
                    />
                  ))}
                </div>
              ) : (
                <div>
                  <p className="p-4">No jobs found.</p>
                </div>
              )}
              {/* Desktop Paginator */}
              <Paginator
                totalItems={jobs.filteredJobs.length}
                itemsPerPage={jobs_page_size}
                onPageChange={(page) => setJobsPage(page)}
              />
            </div>

            {/* Job Details */}
            <div className="w-2/3 flex flex-col overflow-hidden">
              {selectedJob?.id ? (
                <JobDetails
                  job={selectedJob}
                  actions={[
                    <Button
                      key="1"
                      disabled={applications.appliedJob(selectedJob.id ?? "")}
                      scheme={
                        applications.appliedJob(selectedJob.id ?? "")
                          ? "supportive"
                          : "primary"
                      }
                      onClick={handleApply}
                    >
                      {applications.appliedJob(selectedJob.id ?? "") && (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      {applications.appliedJob(selectedJob.id ?? "")
                        ? "Applied"
                        : "Apply"}
                    </Button>,
                    <Button
                      key="2"
                      variant="outline"
                      onClick={() => handleSave(selectedJob)}
                      scheme={
                        savedJobs.isJobSaved(selectedJob.id)
                          ? "destructive"
                          : "default"
                      }
                    >
                      {savedJobs.isJobSaved(selectedJob.id ?? "") && <Heart />}
                      {savedJobs.isJobSaved(selectedJob.id ?? "")
                        ? savedJobs.isToggling
                          ? "Unsaving..."
                          : "Saved"
                        : savedJobs.isToggling
                        ? "Saving..."
                        : "Save"}
                    </Button>,
                  ]}
                />
              ) : (
                <div className="h-full m-auto">
                  <div className="flex flex-col items-center pt-[25vh] h-screen">
                    <div className="opacity-35 mb-10">
                      <div className="flex flex-row justify-center w-full">
                        <h1 className="block text-6xl font-heading font-bold ">
                          BetterInternship
                        </h1>
                      </div>
                      <br />
                      <div className="flex flex-row justify-center w-full">
                        <p className="block text-2xl tracking-tight">
                          Better Internships Start Here
                        </p>
                      </div>
                    </div>
                    <div className="w-prose text-center border border-primary border-opacity-50 text-primary shadow-sm rounded-[0.33em] opacity-85 p-4 bg-white">
                      Click on a job listing to view more details!
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Mobile Job Details Modal */}
      <JobModal job={selectedJob} handleApply={handleApply} ref={jobModalRef} />

      {/* Success Modal */}
      <ApplySuccessModal job={selectedJob} ref={successModalRef} />

      {/* Application Confirmation Modal - Redesigned */}
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
                {selectedJob?.title}
              </span>
              {selectedJob?.employer?.name && (
                <>
                  {" "}
                  at{" "}
                  <span className="font-semibold text-gray-900">
                    {selectedJob.employer.name}
                  </span>
                </>
              )}
            </p>
          </div>

          {/* Profile Preview Section */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => {
                closeApplicationConfirmationModal();
                openProfilePreviewModal();
              }}
              className="w-full h-12 transition-all duration-200"
            >
              <div className="flex items-center justify-center gap-3">
                <span>Preview Your Profile</span>
              </div>
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">
              See how employers will view your application
            </p>
          </div>

          {/* Cover Letter Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clipboard className="w-4 h-4 text-amber-600" />
                </div>
                <label
                  htmlFor="add-cover-letter"
                  className="font-medium text-gray-900"
                >
                  Cover Letter
                </label>
              </div>
              {!selectedJob?.require_cover_letter && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="add-cover-letter"
                    checked={
                      showCoverLetterInput ||
                      (selectedJob?.require_cover_letter ?? false)
                    }
                    disabled={selectedJob?.require_cover_letter ?? false}
                    onChange={() =>
                      setShowCoverLetterInput(!showCoverLetterInput)
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-500">Include</span>
                </div>
              )}
            </div>

            {(showCoverLetterInput ||
              (selectedJob?.require_cover_letter ?? false)) && (
              <div className="space-y-3">
                <Textarea
                  ref={textarea_ref}
                  placeholder="Dear Hiring Manager,

I am excited to apply for this position because...

Best regards,
[Your name]"
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

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                closeApplicationConfirmationModal();
                setShowCoverLetterInput(false);
              }}
              className="flex-1 h-12 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                closeApplicationConfirmationModal();
                handleDirectApplication();
                setShowCoverLetterInput(false);
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

      {/* Profile Preview Modal */}
      <ProfilePreviewModal>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            closeProfilePreviewModal();
            openApplicationConfirmationModal();
          }}
          className="h-8 w-8 p-0 ml-4 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </Button>

        {profile.data && (
          <ApplicantModalContent
            applicant={profile.data}
            pfp_fetcher={() => UserService.getUserPfpURL("me")}
            pfp_route="/users/me/pic"
            open_resume={async () => {
              closeProfilePreviewModal();
              await syncResumeURL();
              openResumeModal();
            }}
            open_calendar={async () => {
              openURL(profile.data?.calendar_link);
            }}
          />
        )}
      </ProfilePreviewModal>

      {/* Resume Modal */}
      {resumeURL.length > 0 && (
        <ResumeModal>
          <div className="space-y-4">
            <h1 className="text-2xl font-bold px-6 pt-2">Resume Preview</h1>
            <PDFPreview url={resumeURL} />
          </div>
        </ResumeModal>
      )}

      {/* Incomplete Profile Modal */}
      <IncompleteProfileModal
        ref={incompleteModalRef}
        profile={profile}
        job={selectedJob}
      />
    </>
  );
}
