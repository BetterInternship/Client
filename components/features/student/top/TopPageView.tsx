"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";
import { Button, cn } from "@betterinternship/components";
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
import { TOP_UNIVERSITY_LINE } from "@/lib/utils/top-page-heading";
import { TopHeroArtwork, TopPageBackdrop } from "./TopArtwork";
import { TopDiscordCTA } from "./TopDiscordCTA";
import { TopPageNavbar } from "./TopPageNavbar";
import { currentManilaWeek } from "@/lib/utils/manila-week";
import { topAccentStyle } from "@/lib/utils/top-page-presentation";
import type {
  PublicTopPage,
  PublicTopUniversity,
  TopPageLink,
} from "@/lib/api/top-page.server";
import { useMassApplySelection } from "@/hooks/use-mass-apply-selection";
import { SearchCommandBar } from "@/components/features/student/search/SearchCommandBar";
import motionStyles from "./top-motion.module.css";
import { useDbRefs } from "@/lib/db/use-refs";
import useModalRegistry from "@/components/modals/modal-registry";
import emptyArtwork from "@/public/student/error.png";

/**
 * The public Top page (plan §5.2). Server-rendered once per request (up to
 * the 60s revalidate window) — `initialJobs` is that snapshot; this
 * component never refetches it client-side. The university filter and open
 * detail panel are client-owned interaction state.
 */
export function TopPageView({
  page,
  university,
  siblings = [],
  initialJobs,
  weekKey,
  disabled,
}: {
  page: PublicTopPage;
  /**
   * The university whose link this is (/<university>/top/<slug>) — named in
   * the heading, the source of the page's colour, and what the logged-out
   * partner control is about. The god preview passes a placeholder, since a
   * category is shared by many universities.
   */
  university?: PublicTopUniversity;
  /** The same university's other live categories, linked under the grid. */
  siblings?: TopPageLink[];
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
  const { get_university } = useDbRefs();
  const modalRegistry = useModalRegistry();
  const universityName = get_university(profile.data?.university)?.name;
  const applicationActions = useApplicationActions();
  const bulkApply = useMassApplySelection(page.id, university?.id);
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
        top_page_university_id: university?.id,
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
          colors: university?.accent_hex
            ? [university.accent_hex, "#ffffff"]
            : undefined,
        });
      }
    },
    [
      applicationActions.create,
      page.id,
      university?.id,
      university?.accent_hex,
      applySuccessModalRef,
      prefersReducedMotion,
    ],
  );

  const accentStyle = topAccentStyle(university?.accent_hex);
  const week = currentManilaWeek();

  return (
    <div
      style={accentStyle}
      className="relative min-h-screen w-full shrink-0 overflow-hidden bg-[var(--top-surface)] max-md:overflow-clip"
    >
      <TopPageBackdrop />
      <TopPageNavbar disabled={disabled} />
      <header className="relative mx-auto max-w-[1240px] px-4 pt-9 max-sm:pt-6 sm:px-6 lg:px-8 lg:pt-7">
        <div className="relative grid items-center gap-4 lg:min-h-[300px] lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-0">
          <div className="relative z-10 min-w-0 lg:py-5">
            <div className="mb-1 flex w-fit items-center gap-2.5">
              <span className="text-base font-medium leading-6 text-[#526078] tabular-nums sm:text-lg">
                {week.label}
              </span>
            </div>
            <h1 className="min-w-0 text-4xl font-bold leading-[1.08] tracking-tight text-[#101033] max-sm:text-[clamp(1.25rem,7vw,2rem)] max-sm:leading-[1.12] sm:text-[clamp(2rem,3.6vw,3.25rem)]">
              {page.slug === "operations-human-resources" ? (
                <>
                  <span className="whitespace-nowrap">
                    Top {initialJobs.length}{" "}
                    <span className="text-[var(--top-accent-text)]">
                      Operations &amp; Human
                    </span>
                  </span>
                  <br />
                  <span className="whitespace-nowrap">
                    <span className="text-[var(--top-accent-text)]">
                      Resources
                    </span>{" "}
                    Internship{initialJobs.length === 1 ? "" : "s"}
                  </span>
                  <br />
                  This Week
                </>
              ) : (
                <>
                  <span
                    className={cn(
                      "inline-block",
                      page.slug === "accounting-finance" && "whitespace-nowrap",
                    )}
                  >
                    Top {initialJobs.length}{" "}
                    <span className="text-[var(--top-accent-text)]">
                      {page.name}
                    </span>
                  </span>{" "}
                  <span className="inline-block whitespace-nowrap">
                    Internship{initialJobs.length === 1 ? "" : "s"} This Week
                  </span>
                </>
              )}
              {/* Inside the <h1> on purpose: the university's name is part
                  of what the page is about, not a caption beside it. */}
              {university && (
                <span className="mt-3 block text-xl font-semibold leading-snug tracking-normal text-[#526078] max-sm:mt-2 max-sm:text-lg sm:text-2xl">
                  {TOP_UNIVERSITY_LINE.before}
                  <span className="text-[var(--top-accent-text)]">
                    {university.name}
                  </span>
                  {TOP_UNIVERSITY_LINE.after}
                </span>
              )}
            </h1>
            <div className="mt-8 max-sm:mt-6">
              <ShowMoaButton
                university={university}
                pageJobs={initialJobs}
                onFilterChange={setMoaFilteredJobs}
                active={moaActive}
                onActiveChange={setMoaActive}
                disabled={disabled}
              />
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[460px] -translate-y-4 max-sm:hidden lg:absolute lg:-right-5 lg:-top-12 lg:w-[500px] lg:max-w-none">
            <TopHeroArtwork pageSlug={page.slug} />
          </div>
        </div>
      </header>

      <div
        className={cn(
          "relative mx-auto w-full max-w-[1240px] px-4 pt-8 max-sm:pb-6 max-sm:pt-4 sm:px-6 lg:px-8 lg:pt-6",
          bulkApply.selectMode && "pb-32 sm:pb-32",
        )}
      >
        {weekKey && (
          <Suspense fallback={null}>
            <TopPageWeekWatcher
              page={page}
              university={university}
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
              <div
                className="py-8 text-center text-muted-foreground sm:py-12"
                role="status"
              >
                {moaFilteredJobs !== null ? (
                  <>
                    <Image
                      src={emptyArtwork}
                      alt=""
                      className="mx-auto mb-5 h-auto w-[240px] max-w-full mix-blend-multiply sm:w-[300px]"
                      style={{ filter: "var(--top-artwork-filter, none)" }}
                      sizes="(min-width: 640px) 300px, 240px"
                    />
                    <h2 className="text-2xl font-semibold tracking-tight text-[#101033]">
                      Help us help you
                    </h2>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-6">
                      No internships in this week&apos;s collection match{" "}
                      {universityName ?? "your university"}&apos;s partnerships
                      yet.
                    </p>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6">
                      Invite your university to BetterInternship and copy us in
                      so we can help connect them with partner companies.
                    </p>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                      <Button
                        type="button"
                        disabled={disabled || !universityName}
                        onClick={() => {
                          if (universityName)
                            modalRegistry.inviteUniversity.open({
                              universityName,
                            });
                        }}
                        className="min-h-11"
                      >
                        Invite your university
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setMoaFilteredJobs(null);
                          setMoaActive(false);
                        }}
                        className="min-h-11"
                      >
                        Show all internships
                      </Button>
                    </div>
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
                  "grid items-stretch gap-3 sm:auto-rows-fr sm:gap-4 lg:gap-5",
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
        <div
          className={motionStyles.ctaColumn}
          data-panel-open={panelOpen}
          style={{
            width: panelOpen
              ? "min(100%, calc(100% - var(--top-panel-width) + max(0px, calc((100vw - 1240px) / 2))))"
              : "100%",
          }}
        >
          {/* Inside the column so the links narrow with it when the side
              panel is open, instead of running underneath the panel. */}
          {university && (
            <nav
              aria-label={`More internships for ${university.name} students`}
              className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm"
            >
              <span className="font-semibold text-[#101033]">
                More for {university.name}:
              </span>
              {/* The preview has no real university behind these links, so
                  they are shown as plain text there. */}
              {[
                ...siblings.map((sibling) => ({
                  href: `/${university.slug}/top/${sibling.slug}`,
                  label: `${sibling.name} Internships`,
                })),
                { href: `/${university.slug}`, label: "All categories" },
              ].map(({ href, label }) =>
                disabled ? (
                  <span
                    key={href}
                    className="font-medium text-[var(--top-accent-text)]"
                  >
                    {label}
                  </span>
                ) : (
                  <Link
                    key={href}
                    href={href}
                    className="font-medium text-[var(--top-accent-text)] underline-offset-4 hover:underline"
                  >
                    {label}
                  </Link>
                ),
              )}
            </nav>
          )}
          <TopDiscordCTA compact={panelOpen} />
        </div>
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
