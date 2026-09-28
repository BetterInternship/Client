"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@betterinternship/components";
import { Job } from "@/lib/db/db.types";
import { useMobile } from "@/hooks/use-mobile";
import { useProfileData } from "@/lib/api/student.data.api";
import { useApplicationActions } from "@/lib/api/student.actions.api";
import { useMassApplySelection } from "@/hooks/use-mass-apply-selection";
import { useModalRef } from "@/hooks/use-modal";
import { SearchCommandBar } from "@/components/features/student/search/SearchCommandBar";
import { JobModal } from "@/components/modals/JobModal";
import { ApplySuccessModal } from "@/components/modals/ApplySuccessModal";
import { TopJobCard } from "./TopJobCard";
import { TopJobPanel } from "./TopJobPanel";
import { topHeading } from "@/lib/utils/top-page-heading";
import { currentManilaWeek } from "@/lib/utils/manila-week";
import { pickForeground } from "@/lib/utils/contrast";
import type { PublicTopPage } from "@/lib/api/top-page.server";

/**
 * The public Top page (plan §5.2). Server-rendered once per request (up to
 * the 60s revalidate window) — `initialJobs` is that snapshot; this
 * component never refetches it client-side, only the interaction state
 * (selection, the open panel) is client-owned.
 */
export function TopPageView({
  page,
  initialJobs,
  disabled,
}: {
  page: PublicTopPage;
  initialJobs: Job[];
  disabled?: boolean;
}) {
  const { isMobile } = useMobile();
  const profile = useProfileData();
  const applicationActions = useApplicationActions();
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
  } = useMassApplySelection(page.id);

  const jobs = initialJobs;

  const [openJobId, setOpenJobId] = useState<string | null>(null);
  const openIndex = jobs.findIndex((job) => job.id === openJobId);
  const openJob = openIndex >= 0 ? jobs[openIndex] : null;

  const jobModalRef = useModalRef();
  const applySuccessModalRef = useModalRef();
  const [lastAppliedJob, setLastAppliedJob] = useState<Job | null>(null);

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= jobs.length) return;
      setOpenJobId(jobs[index].id ?? null);
    },
    [jobs],
  );

  const handleOpen = useCallback(
    (job: Job) => {
      setOpenJobId(job.id ?? null);
      if (isMobile) jobModalRef.current?.open();
    },
    [isMobile, jobModalRef],
  );

  const handleClose = useCallback(() => setOpenJobId(null), []);

  // Bound to a specific job at each ApplyToJobButton/panel call site — every
  // apply made from this page is attributed to it (D20).
  const applyToJob = useCallback(
    async (job: Job, resumeId: string) => {
      const response = await applicationActions.create.mutateAsync({
        job_id: job.id ?? "",
        resume_id: resumeId,
        top_page_id: page.id,
      });
      if (response.message) {
        toast.error(response.message);
        return;
      }
      setLastAppliedJob(job);
      applySuccessModalRef.current?.open();
    },
    [applicationActions.create, page.id, applySuccessModalRef],
  );

  const accent = page.accent_hex;
  const accentStyle = accent
    ? ({
        "--primary": accent,
        "--primary-foreground": pickForeground(accent),
      } as React.CSSProperties)
    : undefined;
  const heading = topHeading(jobs.length, page.name);
  const week = currentManilaWeek();

  return (
    <div
      style={accentStyle}
      className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8"
    >
      <SearchCommandBar
        visible={selectMode}
        selected={selectedJobsList}
        selectedCount={selectedJobsList.length}
        onCancel={() => {
          setSelectMode(false);
          clearSelection();
        }}
        onUnselectPage={() => unselectAllOnPage(jobs)}
        onSelectPage={() => selectAllOnPage(jobs)}
        onApply={disabled ? () => {} : openMassApply}
        onToggleSelect={toggleSelect}
      />

      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl">
          {heading}
        </h1>
        <p className="mt-2 text-muted-foreground">{week.label}</p>
      </header>

      {jobs.length === 0 ? (
        <div className="rounded-[0.33em] border border-dashed border-gray-300 p-12 text-center text-muted-foreground">
          <p>No featured internships right now.</p>
          <Link
            href="/search"
            className="mt-2 inline-block text-primary underline"
          >
            Browse all listings
          </Link>
        </div>
      ) : (
        <div
          className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3")}
        >
          {jobs.map((job) => (
            <TopJobCard
              key={job.id}
              job={job}
              profile={profile.data}
              selected={job.id === openJobId}
              onOpen={() => handleOpen(job)}
              isSelected={isSelected(job.id)}
              onToggleSelect={toggleSelect}
              onApply={({ resumeId }) => applyToJob(job, resumeId)}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {!isMobile && openJob && (
        <TopJobPanel
          job={openJob}
          profile={profile.data}
          hasPrev={openIndex > 0}
          hasNext={openIndex < jobs.length - 1}
          onPrev={() => goTo(openIndex - 1)}
          onNext={() => goTo(openIndex + 1)}
          onClose={handleClose}
          onApply={({ resumeId }) => applyToJob(openJob, resumeId)}
          disabled={disabled}
        />
      )}

      {isMobile && openJob && (
        <JobModal
          job={openJob}
          onApply={({ resumeId }) => applyToJob(openJob, resumeId)}
          ref={jobModalRef}
          onPrev={{
            disabled: openIndex <= 0,
            onClick: () => goTo(openIndex - 1),
          }}
          onNext={{
            disabled: openIndex >= jobs.length - 1,
            onClick: () => goTo(openIndex + 1),
          }}
          disabled={disabled}
        />
      )}

      <ApplySuccessModal job={lastAppliedJob} ref={applySuccessModalRef} />
    </div>
  );
}
