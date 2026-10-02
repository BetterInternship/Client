"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";
import { Badge, cn } from "@betterinternship/components";
import { CalendarDays } from "lucide-react";
import { Job } from "@/lib/db/db.types";
import { useMobile } from "@/hooks/use-mobile";
import { useProfileData } from "@/lib/api/student.data.api";
import { useApplicationActions } from "@/lib/api/student.actions.api";
import { useModalRef } from "@/hooks/use-modal";
import { JobModal } from "@/components/modals/JobModal";
import { ApplySuccessModal } from "@/components/modals/ApplySuccessModal";
import { TopJobCard } from "./TopJobCard";
import { TopJobPanel } from "./TopJobPanel";
import { ShowMoaButton } from "./ShowMoaButton";
import { TopPageWeekWatcher } from "./TopPageWeekWatcher";
import { DEFAULT_TOP_PAGE_ACCENT } from "@/lib/utils/top-page-heading";
import { TopHeroArtwork, TopPageBackdrop } from "./TopArtwork";
import { TopDiscordCTA } from "./TopDiscordCTA";
import { TopPageNavbar } from "./TopPageNavbar";
import { currentManilaWeek } from "@/lib/utils/manila-week";
import { pickForeground } from "@/lib/utils/contrast";
import { topAccentTextColor } from "@/lib/utils/top-page-presentation";
import type { PublicTopPage } from "@/lib/api/top-page.server";
import { useMassApplySelection } from "@/hooks/use-mass-apply-selection";
import { SearchCommandBar } from "@/components/features/student/search/SearchCommandBar";
import motionStyles from "./top-motion.module.css";

/**
 * The public Top page (plan §5.2). Server-rendered once per request (up to
 * the 60s revalidate window) — `initialJobs` is that snapshot; this
 * component never refetches it client-side. The university filter and open
 * detail panel are client-owned interaction state.
 */
export function TopPageView({
  page,
  initialJobs,
  weekKey,
  disabled,
}: {
  page: PublicTopPage;
  initialJobs: Job[];
  /**
   * The server's current week ("YYYY-MM-DD" Sunday, Manila). Only the public
   * page passes it; without it (the god preview) there is no old-QR banner
   * and no visit event.
   */
  weekKey?: string;
  disabled?: boolean;
}) {
  const { isMobile } = useMobile();
  const profile = useProfileData();
  const applicationActions = useApplicationActions();
  const bulkApply = useMassApplySelection(page.id);
  const prefersReducedMotion = useReducedMotion();
  const [moaActive, setMoaActive] = useState(false);

  // Null = no filter; the Top page's own curated set is always the base —
  // "Show companies with MOA" narrows it down, never replaces it with a
  // wider /search result (see ShowMoaButton).
  const [moaFilteredJobs, setMoaFilteredJobs] = useState<Job[] | null>(null);
  const jobs = moaFilteredJobs ?? initialJobs;
  const resultsRef = useRef<HTMLDivElement>(null);
  const previousJobs = useRef(jobs);
  useEffect(() => {
    const changed = previousJobs.current !== jobs;
    previousJobs.current = jobs;
    if (!changed || prefersReducedMotion) return;
    const animation = resultsRef.current?.animate(
      [{ opacity: 0.65 }, { opacity: 1 }],
      { duration: 160, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
    );
    return () => animation?.cancel();
  }, [jobs, prefersReducedMotion]);

  const [openJobId, setOpenJobId] = useState<string | null>(null);
  const openIndex = jobs.findIndex((job) => job.id === openJobId);
  const openJob = openIndex >= 0 ? jobs[openIndex] : null;
  const panelOpen = !isMobile && !!openJob;
  const layoutTransition = {
    duration: prefersReducedMotion ? 0 : 0.24,
    ease: [0.23, 1, 0.32, 1] as const,
  };

  const jobModalRef = useModalRef();
  const applySuccessModalRef = useModalRef();
  const [lastAppliedJob, setLastAppliedJob] = useState<Job | null>(null);

  // The first mobile click mounts the modal; open it once its ref exists.
  useEffect(() => {
    if (isMobile && openJobId) jobModalRef.current?.open();
  }, [isMobile, openJobId, jobModalRef]);

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

      // Confetti is local to this apply path (Top pages only) — the shared
      // ApplySuccessModal itself stays plain for every other apply flow.
      if (!prefersReducedMotion) {
        void confetti({
          particleCount: 90,
          spread: 75,
          startVelocity: 32,
          origin: { y: 0.65 },
          colors: page.accent_hex ? [page.accent_hex, "#ffffff"] : undefined,
        });
      }
    },
    [
      applicationActions.create,
      page.id,
      page.accent_hex,
      applySuccessModalRef,
      prefersReducedMotion,
    ],
  );

  const accent = page.accent_hex ?? DEFAULT_TOP_PAGE_ACCENT;
  const accentStyle = accent
    ? ({
        "--primary": accent,
        "--primary-foreground": pickForeground(accent),
        "--color-primary": accent,
        "--color-primary-foreground": pickForeground(accent),
        "--color-muted-foreground": "#626fa5",
        "--top-accent-text": topAccentTextColor(accent),
        "--top-panel-width": "min(46vw, 42rem)",
      } as React.CSSProperties)
    : undefined;
  const week = currentManilaWeek();

  return (
    <div
      style={accentStyle}
      className="relative min-h-screen w-full shrink-0 overflow-hidden bg-[#f7fbff]"
    >
      <TopPageBackdrop />
      <TopPageNavbar disabled={disabled} />
      <header className="relative mx-auto max-w-[1240px] px-4 pt-6 sm:px-6 sm:pt-9 lg:px-8 lg:pt-7">
        <div className="relative grid items-center gap-4 lg:min-h-[300px] lg:grid-cols-[1.2fr_1fr] lg:gap-0">
          <div className="relative z-10 lg:py-5">
            <Badge
              variant="outline"
              type="default"
              className="mb-5 w-fit gap-2.5 border-[#dde6ef] bg-white px-3 py-2 text-[13px] font-medium leading-none text-[#526078] shadow-[0_1px_2px_rgba(31,61,98,0.04)]"
            >
              <CalendarDays
                className="h-4 w-4 shrink-0 text-[var(--top-accent-text)]"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <span className="tabular-nums">{week.label}</span>
            </Badge>
            <h1 className="text-[34px] font-bold leading-[1.08] tracking-tight text-[#101033] sm:text-5xl lg:text-[52px]">
              Top {initialJobs.length}{" "}
              <span className="text-[var(--top-accent-text)]">{page.name}</span>
              <br className="hidden sm:block" /> Internship
              {initialJobs.length === 1 ? "" : "s"} This Week
            </h1>
            <div className="mt-6 sm:mt-8">
              <ShowMoaButton
                pageJobs={initialJobs}
                onFilterChange={setMoaFilteredJobs}
                active={moaActive}
                onActiveChange={setMoaActive}
              />
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[340px] -translate-y-4 sm:max-w-[460px] lg:absolute lg:-right-5 lg:-top-12 lg:w-[500px] lg:max-w-none">
            <TopHeroArtwork />
          </div>
        </div>
      </header>

      <div
        className={cn(
          "relative mx-auto w-full max-w-[1240px] px-4 pb-6 pt-2 sm:px-6 sm:pt-8 lg:px-8 lg:pt-6",
          bulkApply.selectMode && "pb-32 sm:pb-32",
        )}
      >
        {weekKey && (
          <Suspense fallback={null}>
            <TopPageWeekWatcher
              page={page}
              weekKey={weekKey}
              jobCount={initialJobs.length}
            />
          </Suspense>
        )}

        <LayoutGroup>
          <motion.div
            ref={resultsRef}
            layout={prefersReducedMotion ? false : true}
            transition={{ layout: layoutTransition }}
            style={{
              // Keep the centered container's left gutter. Subtract only
              // the part of the aside that overlaps the original grid.
              width: panelOpen
                ? "min(100%, calc(100% - var(--top-panel-width) + max(0px, calc((100vw - 1240px) / 2))))"
                : "100%",
              transformOrigin: "left top",
            }}
          >
            {jobs.length === 0 ? (
              <div className="rounded-[0.33em] border border-dashed border-gray-300 p-12 text-center text-muted-foreground">
                {moaFilteredJobs !== null ? (
                  <>
                    <p>
                      None of this week&apos;s internships have an MOA with your
                      university yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setMoaFilteredJobs(null);
                        setMoaActive(false);
                      }}
                      className="mt-2 inline-block cursor-pointer text-gray-700 underline hover:text-gray-900"
                    >
                      Clear filter
                    </button>
                  </>
                ) : (
                  <>
                    <p>No featured internships right now.</p>
                    <Link
                      href="/search"
                      className="mt-2 inline-block text-primary underline"
                    >
                      Browse all listings
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <div
                className={cn(
                  motionStyles.jobGrid,
                  "grid auto-rows-fr items-stretch gap-3 sm:gap-4 lg:gap-5",
                )}
                data-panel-open={panelOpen}
              >
                {jobs.map((job) => (
                  <motion.div
                    key={job.id}
                    layout={prefersReducedMotion ? false : "position"}
                    transition={{ layout: layoutTransition }}
                    className="min-w-0"
                  >
                    <TopJobCard
                      job={job}
                      profile={profile.data}
                      selected={job.id === openJobId}
                      onOpen={() => handleOpen(job)}
                      onApply={({ resumeId }) => applyToJob(job, resumeId)}
                      disabled={disabled}
                      bulkSelected={bulkApply.isSelected(job.id)}
                      onToggleSelect={() => {
                        if (disabled) return;
                        bulkApply.setSelectMode(true);
                        bulkApply.toggleSelect(job);
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </LayoutGroup>

        <AnimatePresence>
          {!isMobile && openJob && (
            <TopJobPanel
              key="top-job-panel"
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
        </AnimatePresence>

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
      <div className="relative mx-auto max-w-[1240px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <TopDiscordCTA />
      </div>
      <SearchCommandBar
        visible={!disabled && bulkApply.selectMode}
        selected={bulkApply.selectedJobsList}
        selectedCount={bulkApply.selectedJobsList.length}
        presentation="curated"
        onCancel={() => {
          bulkApply.setSelectMode(false);
          bulkApply.clearSelection();
        }}
        onUnselectPage={() => bulkApply.unselectAllOnPage(jobs)}
        onSelectPage={() => bulkApply.selectAllOnPage(jobs)}
        onApply={bulkApply.openMassApply}
        onToggleSelect={bulkApply.toggleSelect}
      />
    </div>
  );
}
