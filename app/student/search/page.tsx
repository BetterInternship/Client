"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  useJobListingsPage,
  useJobData,
  useProfileData,
} from "@/lib/api/student.data.api";
import { Job } from "@/lib/db/db.types";
import { useModalRef } from "@/hooks/use-modal";
import { ApplySuccessModal } from "@/components/modals/ApplySuccessModal";
import { JobModal } from "@/components/modals/JobModal";
import { useMobile } from "@/hooks/use-mobile";
import { useApplicationActions } from "@/lib/api/student.actions.api";
import { useMassApplySelection } from "@/hooks/use-mass-apply-selection";
import { Loader } from "@/components/ui/loader";
import type { ApplyPayload } from "@/components/modals/components/ApplyModal";
import { toast } from "sonner";
import { SearchCommandBar } from "@/components/features/student/search/SearchCommandBar";
import { SearchResultsMobile } from "@/components/features/student/search/SearchResultsMobile";
import { SearchResultsDesktop } from "@/components/features/student/search/SearchResultsDesktop";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const { isMobile } = useMobile();

  // selection + bulk apply (plan §5.3 — shared with the Top pages)
  const {
    selectMode,
    setSelectMode,
    selectedJobsList,
    toggleSelect,
    isSelected,
    clearSelection,
    selectAllOnPage,
    unselectAllOnPage,
    openMassApply,
  } = useMassApplySelection();

  // job list & filters
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [position, setPosition] = useState<string[]>([]);
  const [jobModeFilter, setJobModeFilter] = useState<string[]>([]);
  const [jobWorkloadFilter, setJobWorkloadFilter] = useState<string[]>([]);
  const [jobAllowanceFilter, setJobAllowanceFilter] = useState<string[]>([]);
  const [jobMoaFilter, setJobMoaFilter] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // get job list div so we can scroll on page change.
  const listRef = useRef<HTMLDivElement | null>(null);

  const scrollToTop = () => {
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // page + pagination
  const jobsPageSize = 10;
  const [_jobsPage, setJobsPage] = useState(1);

  const handlePageChange = (page: number) => {
    setJobsPage(page);
    scrollToTop();
  };

  // hooks
  const profile = useProfileData();
  const jobs = useJobListingsPage({
    search: searchTerm.trim() || undefined,
    position,
    mode: jobModeFilter,
    workload: jobWorkloadFilter,
    allowance: jobAllowanceFilter,
    moa: jobMoaFilter,
    university: profile.data?.university ?? undefined,
    page: _jobsPage,
    limit: jobsPageSize,
  });
  const applicationActions = useApplicationActions();

  // Modals
  const jobModalRef = useModalRef();
  const applySuccessModalRef = useModalRef();

  // the server already returns just this page's rows
  const jobsPage = jobs.jobs;

  // The panel shows a generic "check your connection" message — log the
  // actual error for debugging.
  useEffect(() => {
    if (jobs.error) console.error("Failed to load jobs:", jobs.error);
  }, [jobs.error]);

  /* --------------------------------------------
    * URL → local filter state
    -------------------------------------------- */
  useEffect(() => {
    const query = searchParams.get("query") || "";
    const pos = (searchParams.get("position") || "").split(",").filter(Boolean);
    const jobAllowance = (searchParams.get("allowance") || "")
      .split(",")
      .filter(Boolean);
    const jobWorkload = (searchParams.get("workload") || "")
      .split(",")
      .filter(Boolean);
    const jobMode = (searchParams.get("mode") || "").split(",").filter(Boolean);
    const jobMoa = (searchParams.get("moa") || "").split(",").filter(Boolean);

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
  }, [
    searchTerm,
    position,
    jobModeFilter,
    jobWorkloadFilter,
    jobAllowanceFilter,
    jobMoaFilter,
  ]);

  // Sync selected job. A shared ?jobId= link may point at a job that isn't
  // on the current page (different sort position, or the link predates this
  // filter/page state) — fall back to fetching it directly rather than
  // silently falling through to "select the first row" (D9b).
  const jobIdParam = searchParams.get("jobId");
  const jobIdOnPage = jobIdParam
    ? jobsPage.find((job) => job.id === jobIdParam)
    : undefined;
  const deepLinkJob = useJobData(jobIdParam ?? "", {
    enabled: !!jobIdParam && !jobIdOnPage && !jobs.isPending,
  });

  useEffect(() => {
    if (jobIdParam) {
      const target = jobIdOnPage ?? deepLinkJob.data ?? undefined;
      if (target && target.id !== selectedJob?.id) setSelectedJob(target);
    } else if (jobsPage.length > 0 && !selectedJob?.id) {
      setSelectedJob(jobsPage[0]);
    }
  }, [jobIdParam, jobIdOnPage, deepLinkJob.data, jobsPage, selectedJob]);

  const handleJobCardClick = (job: Job) => {
    setSelectedJob(job);
    if (isMobile) jobModalRef.current?.open();
  };

  const handleSingleApply = useCallback(
    async ({ resumeId }: ApplyPayload) => {
      if (!selectedJob?.id || !resumeId) return;

      const response = await applicationActions.create.mutateAsync({
        job_id: selectedJob.id,
        resume_id: resumeId,
      });

      if (response.message) {
        toast.error(response.message);
        return;
      }

      applySuccessModalRef.current?.open();
    },
    [applicationActions.create, selectedJob],
  );

  /* =======================================================================================
      UI
    ====================================================================================== */

  return (
    <>
      {/* Floating action bar */}
      <SearchCommandBar
        visible={selectMode}
        selected={selectedJobsList}
        selectedCount={selectedJobsList.length}
        onCancel={() => {
          setSelectMode(false);
          clearSelection();
        }}
        onUnselectPage={() => unselectAllOnPage(jobsPage)}
        onSelectPage={() => selectAllOnPage(jobsPage)}
        onApply={openMassApply}
        onToggleSelect={toggleSelect}
      />

      <div className="flex-1 flex overflow-hidden border-primary">
        {jobs.isPending ? (
          <Loader>Loading...</Loader>
        ) : isMobile ? (
          <SearchResultsMobile
            jobs={jobs}
            jobsPage={jobsPage}
            jobsPageSize={jobsPageSize}
            currentPage={_jobsPage}
            onPageChange={handlePageChange}
            listRef={listRef}
            selectMode={selectMode}
            setSelectMode={setSelectMode}
            toggleSelect={toggleSelect}
            isSelected={isSelected}
            onJobCardClick={handleJobCardClick}
          />
        ) : (
          <SearchResultsDesktop
            jobs={jobs}
            jobsPage={jobsPage}
            jobsPageSize={jobsPageSize}
            currentPage={_jobsPage}
            onPageChange={handlePageChange}
            listRef={listRef}
            selectMode={selectMode}
            setSelectMode={setSelectMode}
            toggleSelect={toggleSelect}
            isSelected={isSelected}
            onJobCardClick={handleJobCardClick}
            selectedJob={selectedJob}
            profileData={profile.data}
            onSingleApply={handleSingleApply}
          />
        )}
      </div>

      {/* Mobile Job Details Modal */}
      {selectedJob && (
        <JobModal
          job={selectedJob}
          onApply={handleSingleApply}
          ref={jobModalRef}
        />
      )}

      {/* Success Modal */}
      <ApplySuccessModal job={selectedJob} ref={applySuccessModalRef} />
    </>
  );
}
