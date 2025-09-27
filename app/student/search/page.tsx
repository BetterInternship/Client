"use client";

import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  Clipboard,
  ArrowLeft,
  CheckSquare,
  Square,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useJobs, useProfile, useApplications } from "@/lib/api/student.api";
import { useAuthContext } from "@/lib/ctx-auth";
import { Job } from "@/lib/db/db.types";
import { Paginator } from "@/components/ui/paginator";
import { useModal, useModalRef } from "@/hooks/use-modal";
import { JobCard, JobDetails, MobileJobCard } from "@/components/shared/jobs";
import { ApplicantModalContent } from "@/components/shared/applicant-modal";
import { UserService } from "@/lib/api/services";
import { useFile } from "@/hooks/use-file";
import { PDFPreview } from "@/components/shared/pdf-preview";
import { openURL } from "@/lib/utils/url-utils";
import { IncompleteProfileContent } from "@/components/modals/IncompleteProfileModal";
import { ApplySuccessModal } from "@/components/modals/ApplySuccessModal";
import { JobModal } from "@/components/modals/JobModal";
import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { useGlobalModal } from "@/components/providers/ModalProvider";
import { useQueryClient } from "@tanstack/react-query";
import {
  isProfileBaseComplete,
  isProfileResume,
  isProfileVerified,
} from "@/lib/profile";
import { AutoApplyToast } from "@/components/features/student/search/AutoApplyToast";
import { useRouter } from "next/navigation";
import { SaveJobButton } from "@/components/features/student/job/save-job-button";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthContext();
  const { isMobile } = useMobile();

  // selection + bulk apply
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkCoverLetter, setBulkCoverLetter] = useState("");

  // job list & filters
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [position, setPosition] = useState<string[]>([]);
  const [jobModeFilter, setJobModeFilter] = useState<string[]>([]);
  const [jobWorkloadFilter, setJobWorkloadFilter] = useState<string[]>([]);
  const [jobAllowanceFilter, setJobAllowanceFilter] = useState<string[]>([]);
  const [jobMoaFilter, setJobMoaFilter] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // page + pagination
  const jobsPageSize = 10;
  const [_jobsPage, setJobsPage] = useState(1);

  // hooks
  const jobs = useJobs({
    search: searchTerm.trim() || undefined,
    position,
    jobModeFilter,
    jobWorkloadFilter,
    jobAllowanceFilter,
    jobMoaFilter,
  });
  const applications = useApplications();

  const { open: openGlobalModal, close: closeGlobalModal } = useGlobalModal();

  // resume preview (profile modal)
  const { url: resumeURL, sync: syncResumeURL } = useFile({
    fetcher: UserService.getMyResumeURL,
    route: "/users/me/resume",
  });

  // modals
  const { open: openResumeModal, Modal: ResumeModal } =
    useModal("resume-modal");
  const profile = useProfile();
  const queryClient = useQueryClient();

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

  // mass apply modals
  const {
    open: openMassApplyModal,
    close: closeMassApplyModal,
    Modal: MassApplyModal,
  } = useModal("mass-apply-modal");

  const {
    open: openMassApplyResultModal,
    close: closeMassApplyResultModal,
    Modal: MassApplyResultModal,
  } = useModal("mass-apply-result-modal");

  const jobModalRef = useModalRef();

  const successModalRef = useModalRef();

  // computed pages
  const jobsPage = jobs.getJobsPage({ page: _jobsPage, limit: jobsPageSize });

  useEffect(() => {
    if (profile?.data?.resume) {
      syncResumeURL();
    }
  }, [profile?.data?.resume, syncResumeURL]);

  const openStudentPreview = async () => {
    await syncResumeURL();
    openStudentPreview();
  };

  /* --------------------------------------------
    * URL → local filter state
    -------------------------------------------- */
  useEffect(() => {
    const query = searchParams.get("query") || "";
    const pos = searchParams.get("position")?.split(",") || [];
    const jobAllowance = searchParams.get("allowance")?.split(",") || [];
    const jobWorkload = searchParams.get("workload")?.split(",") || [];
    const jobMode = searchParams.get("mode")?.split(",") || [];
    const jobMoa = searchParams.get("moa")?.split(",") || [];

    setPosition(pos);
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

  // Sync selected job
  useEffect(() => {
    const jobId = searchParams.get("jobId");
    if (jobId && jobsPage.length > 0) {
      const targetJob = jobsPage.find((job) => job.id === jobId);
      if (targetJob && targetJob.id !== selectedJob?.id)
        setSelectedJob(targetJob);
    } else if (jobsPage.length > 0 && !selectedJob?.id) {
      setSelectedJob(jobsPage[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobsPage.length, searchParams]);

  /* --------------------------------------------
    * Selection helpers
    -------------------------------------------- */
  const toggleSelect = (jobId: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(jobId) ? next.delete(jobId) : next.add(jobId);
      return next;
    });

  const isSelected = (jobId?: string) => !!jobId && selectedIds.has(jobId);

  const clearSelection = () => setSelectedIds(new Set());

  const selectAllOnPage = () => {
    const next = new Set(selectedIds);
    jobsPage.forEach((j) => j.id && next.add(j.id));
    setSelectedIds(next);
  };

  const unselectAllOnPage = () => {
    const next = new Set(selectedIds);
    jobsPage.forEach((j) => j.id && next.delete(j.id));
    setSelectedIds(next);
  };

  const selectedJobsList = useMemo(
    () => jobs.filteredJobs.filter((j) => j.id && selectedIds.has(j.id)),
    [jobs.filteredJobs, selectedIds]
  );

  /* --------------------------------------------
    * Single apply actions
    -------------------------------------------- */

  const handleApply = () => {
    if (!isAuthenticated()) {
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
      return;
    }

    if (
      !isProfileResume(profile.data) ||
      !isProfileBaseComplete(profile.data) ||
      !isProfileVerified(profile.data)
    ) {
      return openGlobalModal(
        "incomplete-profile",
        <IncompleteProfileContent
          handleClose={() => closeGlobalModal("incomplete-profile")}
        />,
        {
          allowBackdropClick: false,
          onClose: () => {
            queryClient.invalidateQueries({ queryKey: ["my-profile"] });
          },
        }
      );
    }

    const applied = applications.appliedJob(selectedJob?.id ?? "");
    if (applied) {
      alert("You have already applied to this job!");
      return;
    }

    openApplicationConfirmationModal();
  };

  const handleDirectApplication = async (textFromModal?: string) => {
    if (!selectedJob) return;

    const text = (textFromModal ?? "").trim();

    if ((selectedJob?.require_cover_letter ?? true) && !text) {
      alert("A cover letter is required to apply for this job.");
      return;
    }

    await applications
      .create({
        job_id: selectedJob.id ?? "",
        cover_letter: text,
      })
      .then((response) => {
        if (applications.createError)
          return alert(applications.createError.message);
        if (response?.message) return alert(response.message);
        successModalRef.current?.open();
      });
  };

  const handleJobCardClick = (job: Job) => {
    setSelectedJob(job);
    if (isMobile) jobModalRef.current?.open();
  };

  /* --------------------------------------------
    * Mass apply actions (stable + minimal re-renders)
    -------------------------------------------- */
  const openMassApply = () => {
    if (!isAuthenticated()) {
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
      return;
    }
    if (
      !isProfileResume(profile.data) ||
      !isProfileBaseComplete(profile.data) ||
      !isProfileVerified(profile.data)
    ) {
      openGlobalModal(
        "incomplete-profile",
        <IncompleteProfileContent
          handleClose={() => closeGlobalModal("incomplete-profile")}
        />,
        {
          allowBackdropClick: false,
          onClose: () => {
            queryClient.invalidateQueries({ queryKey: ["my-profile"] });
          },
        }
      );
    }
    const allApplied =
      selectedJobsList.length > 0 &&
      selectedJobsList.every((j) => applications.appliedJob(j.id ?? ""));
    if (!selectedJobsList.length || allApplied) {
      alert(
        "No eligible jobs selected. Select jobs you haven’t applied to yet."
      );
      return;
    }
    openMassApplyModal();
  };

  const [massApplying, setMassApplying] = useState(false);
  const [massResult, setMassResult] = useState<{
    ok: Job[];
    skipped: { job: Job; reason: string }[];
    failed: { job: Job; error: string }[];
  }>({ ok: [], skipped: [], failed: [] });

  // guard against double-submit
  const isSubmittingRef = useRef(false);

  const runMassApply = useCallback(
    async (coverLetter: string) => {
      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;

      try {
        if (!selectedJobsList.length) return;

        const skipped: { job: Job; reason: string }[] = [];
        const eligible: Job[] = [];

        for (const job of selectedJobsList) {
          if (applications.appliedJob(job.id ?? "")) {
            skipped.push({ job, reason: "Already applied" });
            continue;
          }
          const needsGithub =
            job.require_github && !profile.data?.github_link?.trim();
          const needsPortfolio =
            job.require_portfolio && !profile.data?.portfolio_link?.trim();
          const needsCover = job.require_cover_letter && !coverLetter.trim();

          if (needsGithub) {
            skipped.push({ job, reason: "Requires GitHub profile" });
            continue;
          }
          if (needsPortfolio) {
            skipped.push({ job, reason: "Requires portfolio link" });
            continue;
          }
          if (needsCover) {
            skipped.push({ job, reason: "Requires a cover letter" });
            continue;
          }
          eligible.push(job);
        }

        if (!eligible.length) {
          setMassResult({ ok: [], skipped, failed: [] });
          closeMassApplyModal();
          openMassApplyResultModal();
          return;
        }

        setMassApplying(true); // 1 render

        const ok: Job[] = [];
        const failed: { job: Job; error: string }[] = [];

        // sequential, no setState in the loop
        for (const job of eligible) {
          try {
            await applications.create({
              job_id: job.id ?? "",
              cover_letter: coverLetter || "",
            });
            if (applications.createError) {
              failed.push({
                job,
                error: applications.createError.message || "Unknown error",
              });
            } else {
              const error = applications.createResult?.message;
              if (error) failed.push({ job, error });
              else ok.push(job);
            }
          } catch (e: any) {
            failed.push({ job, error: e?.message || "Unknown error" });
          }
        }

        // publish results once (another render)
        setMassApplying(false);
        setMassResult({ ok, skipped, failed });
        closeMassApplyModal();
        openMassApplyResultModal();
      } finally {
        isSubmittingRef.current = false;
      }
    },
    [
      applications,
      profile.data,
      selectedJobsList,
      closeMassApplyModal,
      openMassApplyResultModal,
    ]
  );

  // stable handlers for modal child (no inline lambdas)
  const onCancelCompose = useEvent(() => {
    closeMassApplyModal();
  });
  const onSubmitCompose = useEvent(async (text: string) => {
    setBulkCoverLetter(text); // optional: keep for later reuse
    await runMassApply(text);
  });

  const router = useRouter();

  const goProfile = useCallback(() => {
    closeApplicationConfirmationModal();
    router.push("/profile");
  }, [closeApplicationConfirmationModal, router]);

  // Forever dismiss auto-apply tip
  const dismissTip = async () => {
    try {
      await profile.update({ acknowledged_auto_apply: true });
    } catch (e) {
      console.error("Failed to dismiss auto-apply tip", e);
    }
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

  /* =======================================================================================
      UI
    ====================================================================================== */

  // page toolbar (under the global header)
  const PageToolbar = (
    <div className="border-b bg-white/80">
      <div className="flex items-center justify-between gap-3 px-7 py-2">
        <div className="flex items-center gap-8">
          {(selectMode || selectedIds.size > 0) && (
            <>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllOnPage}
                  className="h-8"
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Select page
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={unselectAllOnPage}
                  className="h-8"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Unselect page
                </Button>
                <span className="text-sm text-gray-600">
                  {selectedIds.size} selected
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectMode ? (
            <>
              <Button
                size="sm"
                onClick={openMassApply}
                className="h-8"
                disabled={selectedIds.size === 0}
              >
                Apply to {selectedIds.size || 0} selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => {
                  setSelectMode(false);
                  clearSelection();
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setSelectMode(true)}
            >
              Mass apply
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {profile.data?.is_verified && (
        <AutoApplyToast
          enabled={!!profile.data?.apply_for_me}
          dismissed={!!profile.data?.acknowledged_auto_apply}
          onDismissForever={dismissTip}
        />
      )}

      {/* In-page toolbar */}
      {!isMobile && PageToolbar}

      <div className="flex-1 flex overflow-hidden min-h-0 max-h-100">
        {jobs.isPending ? (
          <div className="flex-1 flex overflow-hidden min-h-0 max-h-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
              <p className="text-gray-600">Loading jobs...</p>
            </div>
          </div>
        ) : isMobile ? (
          // Mobile list
          <div className="w-full flex flex-col h-full">
            {/* Mass apply toolbar */}
            <div className="px-4 py-2 pt-2 border-b bg-white/80">
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant={selectMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (selectMode && selectedIds.size === 0)
                      setSelectMode(false);
                    else setSelectMode((v) => !v);
                  }}
                >
                  {selectMode ? "Selecting…" : "Mass apply"}
                </Button>
                {selectMode && (
                  <Button
                    size="sm"
                    onClick={openMassApply}
                    disabled={selectedIds.size === 0}
                  >
                    Apply ({selectedIds.size})
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pt-2 px-3">
              {jobsPage.length ? (
                <div className="space-y-4">
                  {jobsPage.map((job) => (
                    <div
                      key={job.id}
                      className="relative group"
                      onClick={() => handleJobCardClick(job)}
                    >
                      {/* selection tick */}
                      {selectMode && (
                        <button
                          type="button"
                          className={cn(
                            "absolute right-2 top-2 z-10 rounded-md bg-white shadow-sm p-1",
                            "hover:shadow transition"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (job.id) toggleSelect(job.id);
                          }}
                        >
                          {isSelected(job.id) ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      )}

                      <MobileJobCard
                        job={job}
                        on_click={() => handleJobCardClick(job)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <p className="p-4">No jobs found.</p>
                </div>
              )}

              <div className="mt-6">
                <Paginator
                  totalItems={jobs.filteredJobs.length}
                  itemsPerPage={jobsPageSize}
                  onPageChange={(page) => setJobsPage(page)}
                />
              </div>
            </div>
          </div>
        ) : (
          // Desktop split view
          <>
            {/* Left: List */}
            <div className="w-1/3 border-r overflow-x-hidden overflow-y-auto p-6">
              {jobsPage.length ? (
                <div className="space-y-3">
                  {jobsPage.map((job) => (
                    <div key={job.id} className="relative group">
                      {/* Embedded select control on the card (shows on hover / select mode) */}
                      <button
                        type="button"
                        aria-label={
                          isSelected(job.id) ? "Unselect job" : "Select job"
                        }
                        className={cn(
                          "absolute right-3 top-3 z-20 h-6 w-6 bg-white/95 backdrop-blur",
                          "flex items-center justify-center shadow-sm transition-opacity",
                          selectMode
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!selectMode) setSelectMode(true);
                          if (job.id) toggleSelect(job.id);
                        }}
                      >
                        {isSelected(job.id) ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                      </button>

                      <div
                        className={cn(
                          isSelected(job.id) &&
                            "ring-1 ring-primary ring-offset-[2px] rounded-[0.4em]"
                        )}
                        onClick={() => handleJobCardClick(job)}
                      >
                        <JobCard
                          job={job}
                          selected={selectedJob?.id === job.id}
                          on_click={() => handleJobCardClick(job)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <p className="p-4">No jobs found.</p>
                </div>
              )}

              <div className="mt-4">
                <Paginator
                  totalItems={jobs.filteredJobs.length}
                  itemsPerPage={jobsPageSize}
                  onPageChange={(page) => setJobsPage(page)}
                />
              </div>
            </div>

            {/* Right: Details */}
            <div className="w-2/3 flex flex-col overflow-hidden">
              {selectedJob?.id ? (
                <JobDetails
                  user={{
                    github_link: profile.data?.github_link ?? null,
                    portfolio_link: profile.data?.portfolio_link ?? null,
                  }}
                  job={selectedJob}
                  actions={[
                    <SaveJobButton job={selectedJob} />,
                    <Button
                      key="1"
                      disabled={applications.appliedJob(selectedJob.id ?? "")}
                      scheme={
                        applications.appliedJob(selectedJob.id ?? "")
                          ? "supportive"
                          : "primary"
                      }
                      onClick={handleApply}
                      size={"md"}
                    >
                      {applications.appliedJob(selectedJob.id ?? "") && (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      {applications.appliedJob(selectedJob.id ?? "")
                        ? "Applied"
                        : "Apply"}
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

      {/* Single-apply Confirmation Modal */}
      <ApplicationConfirmationModal>
        <ApplicationConfirmationBody
          selectedJob={selectedJob}
          profile={profile.data}
          onClose={closeApplicationConfirmationModal}
          onPreview={() => {
            closeApplicationConfirmationModal();
            openProfilePreviewModal();
          }}
          onAddNow={goProfile}
          onSubmit={(text) => {
            closeApplicationConfirmationModal();
            handleDirectApplication(text);
          }}
        />
      </ApplicationConfirmationModal>

      {/* Profile Preview Modal */}
      <ProfilePreviewModal className="max-w-[80vw]">
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
            resume_url={resumeURL}
          />
        )}
      </ProfilePreviewModal>

      {/* Mass Apply — Compose */}
      <MassApplyModal>
        <MassApplyBody
          initialText={bulkCoverLetter}
          onCancel={onCancelCompose}
          onSubmit={onSubmitCompose}
          disabled={massApplying}
        />
      </MassApplyModal>

      {/* Mass Apply — Results */}
      <MassApplyResultModal>
        <div className="max-w-lg mx-auto p-6 space-y-4">
          <h2 className="text-xl font-semibold">Bulk application summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-green-700">Applied</span>
              <span className="font-medium">{massResult.ok.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-amber-700">Skipped</span>
              <span className="font-medium">{massResult.skipped.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-red-700">Failed</span>
              <span className="font-medium">{massResult.failed.length}</span>
            </div>
          </div>

          {massResult.skipped.length > 0 && (
            <div className="border rounded-md p-3">
              <div className="text-sm font-medium mb-2">Skipped</div>
              <ul className="space-y-1 text-sm text-gray-700 max-h-40 overflow-auto">
                {massResult.skipped.map(({ job, reason }) => (
                  <li key={`skip-${job.id}`}>
                    <span className="font-medium">{job.title}</span>{" "}
                    <span className="text-gray-500">— {reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {massResult.failed.length > 0 && (
            <div className="border rounded-md p-3">
              <div className="text-sm font-medium mb-2">Failed</div>
              <ul className="space-y-1 text-sm text-gray-700 max-h-40 overflow-auto">
                {massResult.failed.map(({ job, error }) => (
                  <li key={`fail-${job.id}`}>
                    <span className="font-medium">{job.title}</span>{" "}
                    <span className="text-gray-500">— {error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                closeMassApplyResultModal();
              }}
            >
              Close
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                clearSelection();
                setSelectMode(false);
                closeMassApplyResultModal();
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear selection
            </Button>
          </div>
        </div>
      </MassApplyResultModal>

      {/* Resume Modal */}
      {resumeURL.length > 0 && <ProfileResumePreview url={resumeURL} />}

      <Toaster
        position={isMobile ? "bottom-center" : "bottom-right"}
        closeButton
        richColors
        theme="light"
      />
    </>
  );
}

/* =======================================================================================
    Small helper for resume modal
  ======================================================================================= */

function ProfileResumePreview({ url }: { url: string }) {
  const { Modal: ResumeModal } = useModal("resume-modal");
  return (
    <ResumeModal>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold px-6 pt-2">Resume Preview</h1>
        <PDFPreview url={url} />
      </div>
    </ResumeModal>
  );
}

/* =======================================================================================
    Memoized bodies
  ======================================================================================= */

const MassApplyBody = React.memo(function MassApplyBody({
  initialText,
  onCancel,
  onSubmit,
  disabled,
}: {
  initialText: string;
  onCancel: () => void;
  onSubmit: (text: string) => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState(initialText);

  // refresh the seed when the modal re-opens or seed changes
  useEffect(() => {
    setText(initialText || "");
  }, [initialText]);

  return (
    <div className="max-w-lg mx-auto p-6 space-y-4">
      <h2 className="text-xl font-semibold">Apply to selected jobs</h2>
      <p className="text-sm text-gray-600">
        One cover letter will be used for all selected jobs. We’ll skip any
        postings that require info your profile doesn’t have.
      </p>

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-32"
        maxLength={1000}
        placeholder="Write a brief cover letter…"
      />

      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => onSubmit(text)}
          disabled={disabled}
        >
          {disabled ? "Submitting…" : "Submit applications"}
        </Button>
      </div>
    </div>
  );
});

const ApplicationConfirmationBody = React.memo(
  function ApplicationConfirmationBody({
    selectedJob,
    profile,
    onClose,
    onPreview,
    onAddNow,
    onSubmit,
  }: {
    selectedJob: Job | null;
    profile: any;
    onClose: () => void;
    onPreview: () => void;
    onAddNow: () => void; // should close modal + router.push("/profile")
    onSubmit: (text: string) => void;
  }) {
    const [text, setText] = useState("");

    const needsGH = !!selectedJob?.require_github;
    const needsPF = !!selectedJob?.require_portfolio;
    const needsCL = (selectedJob?.require_cover_letter ?? true) === true;

    const hasGH = !!profile?.github_link?.trim();
    const hasPF = !!profile?.portfolio_link?.trim();
    const hasCL = !!text.trim();

    const unmet: string[] = [];
    if (needsGH && !hasGH) unmet.push("GitHub profile link");
    if (needsPF && !hasPF) unmet.push("Portfolio link");
    if (needsCL && !hasCL) unmet.push("Cover letter");

    const submitDisabled = unmet.length > 0;

    return (
      <div className="max-w-lg mx-auto p-6 pt-0 overflow-auto">
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

        {/* Profile Preview */}
        {/* <div className="mb-6">
          <Button
            variant="outline"
            onClick={onPreview}
            className="w-full h-12 transition-all duration-200"
          >
            <div className="flex items-center justify-center gap-3">
              <span>Preview Your Profile</span>
            </div>
          </Button>
          <p className="text-xs text-gray-500 text-center mt-2">
            See how employers will view your application
          </p>
        </div> */}

        {/* Cover Letter */}
        {needsCL && (
          <div className="mb-6 space-y-3">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Dear Hiring Manager,

I am excited to apply for this position because...

Best regards,
[Your name]`}
              className="w-full h-20 p-3 border border-gray-300 rounded-[0.33em] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none text-sm overflow-y-auto"
              maxLength={500}
            />
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 flex items-center gap-1">
                💡 <span>Mention specific skills and enthusiasm</span>
              </span>
              <span className="text-gray-500">{text.length}/500</span>
            </div>
          </div>
        )}

        {/* Requirements checklist */}
        {(needsCL || needsGH || needsPF) && (
          <>
            <div className="text-sm font-medium mb-2">Requirements</div>
            <div className="mb-6 rounded-[0.33em] border p-4 bg-gray-50">
              <ul className="space-y-2 text-sm">
                {needsGH && (
                  <li className="flex items-center justify-between">
                    <span>GitHub profile link</span>
                    {hasGH ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Ready
                      </span>
                    ) : (
                      <Button size="sm" variant="outline" onClick={onAddNow}>
                        Add now
                      </Button>
                    )}
                  </li>
                )}

                {needsPF && (
                  <li className="flex items-center justify-between">
                    <span>Portfolio link</span>
                    {hasPF ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Ready
                      </span>
                    ) : (
                      <Button size="sm" variant="outline" onClick={onAddNow}>
                        Add now
                      </Button>
                    )}
                  </li>
                )}

                {needsCL && (
                  <li className="flex items-center justify-between">
                    <span>Cover letter</span>
                    {hasCL ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Ready
                      </span>
                    ) : (
                      <span className="text-amber-600">Required</span>
                    )}
                  </li>
                )}
              </ul>
            </div>
          </>
        )}

        {/* Inline error banner (why it didn't submit) */}
        {submitDisabled && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-3 rounded-[0.33em] border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm"
          >
            <div className="font-medium mb-1">Incomplete requirements</div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-12 transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit(text)}
            className="flex-1 h-12 transition-all duration-200"
            disabled={submitDisabled}
            title={
              submitDisabled ? "Complete required items to continue" : undefined
            }
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Submit Application
            </div>
          </Button>
        </div>
      </div>
    );
  }
);

function useEvent<T extends (...args: any[]) => any>(fn: T) {
  const ref = React.useRef(fn);
  useEffect(() => {
    ref.current = fn;
  }, [fn]);
  return useCallback((...args: Parameters<T>) => ref.current(...args), []);
}
