"use client";

import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSearchParams } from "next/navigation";
import { CheckSquare, Square, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useJobsData,
  useProfileData,
  useApplicationsData,
} from "@/lib/api/student.data.api";
import { useAuthContext } from "@/lib/ctx-auth";
import { Job } from "@/lib/db/db.types";
import { Paginator } from "@/components/ui/paginator";
import { useModal, useModalRef } from "@/hooks/use-modal";
import { JobCard, JobDetails, MobileJobCard } from "@/components/shared/jobs";
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
import { ApplyToJobButton } from "@/components/features/student/job/apply-to-job-button";
import { MassApplyModal } from "@/components/modals/MassApplyModal";
import { ApplyConfirmModal } from "@/components/modals/ApplyConfirmModal";
import { applyToJob } from "@/lib/application";
import { PageError } from "@/components/ui/error";
import {
  useApplicationActions,
  useProfileActions,
} from "@/lib/api/student.actions.api";

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
  const jobs = useJobsData({
    search: searchTerm.trim() || undefined,
    position,
    jobModeFilter,
    jobWorkloadFilter,
    jobAllowanceFilter,
    jobMoaFilter,
  });
  const applicationActions = useApplicationActions();
  const applications = useApplicationsData();
  const profile = useProfileData();
  const profileActions = useProfileActions();
  const queryClient = useQueryClient();

  // Modals
  const { open: openGlobalModal, close: closeGlobalModal } = useGlobalModal();
  const {
    open: openMassApplyResultModal,
    close: closeMassApplyResultModal,
    Modal: MassApplyResultModal,
  } = useModal("mass-apply-result-modal");
  const massApplyModalRef = useModalRef();
  const jobModalRef = useModalRef();
  const applySuccessModalRef = useModalRef();
  const applyConfirmModalRef = useModalRef();

  // computed pages
  const jobsPage = jobs.getJobsPage({ page: _jobsPage, limit: jobsPageSize });

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
      selectedJobsList.every((j) => jobs.isJobApplied(j.id!));
    if (!selectedJobsList.length || allApplied) {
      alert(
        "No eligible jobs selected. Select jobs you haven’t applied to yet."
      );
      return;
    }
    massApplyModalRef.current?.open();
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
          if (jobs.isJobApplied(job.id!)) {
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
          massApplyModalRef.current?.close();
          openMassApplyResultModal();
          return;
        }

        setMassApplying(true); // 1 render

        const ok: Job[] = [];
        const failed: { job: Job; error: string }[] = [];

        // sequential, no setState in the loop
        for (const job of eligible) {
          try {
            await applicationActions.create.mutateAsync({
              job_id: job.id ?? "",
              cover_letter: coverLetter || "",
            });
            if (applicationActions.create.error) {
              failed.push({
                job,
                error:
                  applicationActions.create.error.message || "Unknown error",
              });
            } else {
              const error = applicationActions.create.data?.message;
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
        massApplyModalRef.current?.close();
        openMassApplyResultModal();
      } finally {
        isSubmittingRef.current = false;
      }
    },
    [
      applications,
      profile.data,
      selectedJobsList,
      massApplyModalRef,
      openMassApplyResultModal,
    ]
  );

  // stable handlers for modal child (no inline lambdas)
  const onCancelCompose = useEvent(() => {
    massApplyModalRef.current?.close();
  });
  const onSubmitCompose = useEvent(async (text: string) => {
    setBulkCoverLetter(text); // optional: keep for later reuse
    await runMassApply(text);
  });

  const router = useRouter();

  const goProfile = useCallback(() => {
    applyConfirmModalRef.current?.close();
    router.push("/profile");
  }, [applyConfirmModalRef, router]);

  // Forever dismiss auto-apply tip
  const dismissTip = async () => {
    try {
      await profileActions.update.mutateAsync({
        acknowledged_auto_apply: true,
      });
    } catch (e) {
      console.error("Failed to dismiss auto-apply tip", e);
    }
  };

  if (jobs.error)
    return (
      <PageError
        title="Failed to load jobs."
        description={jobs.error.message}
      />
    );

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
                    <ApplyToJobButton
                      profile={profile.data}
                      job={selectedJob}
                      openAppModal={() => applyConfirmModalRef.current?.open()}
                    />,
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
      {selectedJob && (
        <JobModal
          job={selectedJob}
          openAppModal={() => applyConfirmModalRef.current?.open()}
          ref={jobModalRef}
        />
      )}

      {/* Success Modal */}
      <ApplySuccessModal job={selectedJob} ref={applySuccessModalRef} />

      {/* Single-apply Confirmation Modal */}
      <ApplyConfirmModal
        ref={applyConfirmModalRef}
        job={selectedJob}
        onClose={() => applyConfirmModalRef.current?.close()}
        onAddNow={goProfile}
        onSubmit={(text: string) => {
          applyConfirmModalRef.current?.close();
          applyToJob(selectedJob, text).then((response) => {
            if (!response.success) return alert(response.message);
            applySuccessModalRef.current?.open();
          });
        }}
      />

      {/* Mass Apply — Compose */}
      <MassApplyModal
        ref={massApplyModalRef}
        initialText={bulkCoverLetter}
        onCancel={onCancelCompose}
        onSubmit={onSubmitCompose}
        disabled={massApplying}
      />

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

      <Toaster
        position={isMobile ? "bottom-center" : "bottom-right"}
        closeButton
        richColors
        theme="light"
      />
    </>
  );
}

function useEvent<T extends (...args: any[]) => any>(fn: T) {
  const ref = React.useRef(fn);
  useEffect(() => {
    ref.current = fn;
  }, [fn]);
  return useCallback((...args: Parameters<T>) => ref.current(...args), []);
}
