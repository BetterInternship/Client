"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuthContext } from "@/lib/ctx-auth";
import { useJobStatus, useProfileData } from "@/lib/api/student.data.api";
import { useApplicationActions } from "@/lib/api/student.actions.api";
import useModalRegistry from "@/components/modals/modal-registry";
import { savePostLoginRedirect } from "@/lib/post-login-redirect";
import { Job } from "@/lib/db/db.types";
import type { ApplyPayload } from "@/components/modals/components/ApplyModal";
import { googleLoginUrl } from "@/lib/api/urls";

/**
 * Selection + bulk-apply state, pulled out of app/student/search/page.tsx
 * with no behaviour change there (plan §5.3) so the Top pages can reuse it.
 * `topPageId`, when given, is attributed on every mass application (D20),
 * along with `topPageUniversityId` — the university whose Top page link the
 * student is on.
 *
 * @hook
 */
export function useMassApplySelection(
  topPageId?: string,
  topPageUniversityId?: string,
) {
  const { isAuthenticated } = useAuthContext();
  const jobStatus = useJobStatus();
  const profile = useProfileData();
  const applicationActions = useApplicationActions();
  const modalRegistry = useModalRegistry();

  const [selectMode, setSelectMode] = useState(false);
  // Snapshot of the Job object at the moment it was ticked — selections
  // survive page flips and filter changes since the server no longer keeps
  // every listing in memory client-side (D8).
  const [selectedJobs, setSelectedJobs] = useState<Map<string, Job>>(new Map());

  // Auto-close the toolbar when all selections are cleared.
  useEffect(() => {
    if (selectedJobs.size === 0 && selectMode) setSelectMode(false);
  }, [selectedJobs.size, selectMode]);

  const toggleSelect = useCallback((job: Job) => {
    if (!job.id || job.challenge || job.hibernating) return;
    const jobId = job.id;

    setSelectedJobs((prev) => {
      const next = new Map(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.set(jobId, job);
      return next;
    });
  }, []);

  const isSelected = useCallback(
    (jobId?: string) => !!jobId && selectedJobs.has(jobId),
    [selectedJobs],
  );

  const clearSelection = useCallback(() => setSelectedJobs(new Map()), []);

  const selectAllOnPage = useCallback((jobs: Job[]) => {
    setSelectedJobs((prev) => {
      const next = new Map(prev);
      jobs.forEach((job) => {
        if (job.id && !job.challenge && !job.hibernating) next.set(job.id, job);
      });
      return next;
    });
  }, []);

  const unselectAllOnPage = useCallback((jobs: Job[]) => {
    setSelectedJobs((prev) => {
      const next = new Map(prev);
      jobs.forEach((job) => {
        if (job.id) next.delete(job.id);
      });
      return next;
    });
  }, []);

  const selectedJobsList = useMemo(
    () => Array.from(selectedJobs.values()),
    [selectedJobs],
  );

  // guard against double-submit
  const isSubmittingRef = useRef(false);

  const runMassApply = useCallback(
    async (resumeId: string) => {
      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;

      try {
        if (!selectedJobsList.length) return;

        const skipped: { job: Job; reason: string }[] = [];
        const eligible: Job[] = [];

        for (const job of selectedJobsList) {
          if (job.hibernating) {
            skipped.push({ job, reason: "No longer accepting applicants" });
            continue;
          }
          if (jobStatus.isJobApplied(job.id ?? "")) {
            skipped.push({ job, reason: "Already applied" });
            continue;
          }
          const internshipPreferences = job.internship_preferences;
          const needsGithub =
            internshipPreferences?.require_github &&
            !profile.data?.github_link?.trim();
          const needsPortfolio =
            internshipPreferences?.require_portfolio &&
            !profile.data?.portfolio_link?.trim();

          if (needsGithub) {
            skipped.push({ job, reason: "Requires GitHub profile" });
            continue;
          }
          if (needsPortfolio) {
            skipped.push({ job, reason: "Requires portfolio link" });
            continue;
          }
          eligible.push(job);
        }

        if (!eligible.length) {
          const data = {
            ok: [],
            skipped,
            failed: [] as { job: Job; error: string }[],
          };
          modalRegistry.massApplyResult.open({
            massApplyResultsData: data,
            clearSelection,
            setSelectMode,
          });
          return;
        }

        const ok: Job[] = [];
        const failed: { job: Job; error: string }[] = [];

        for (const job of eligible) {
          try {
            await applicationActions.create.mutateAsync({
              job_id: job.id ?? "",
              resume_id: resumeId,
              source: "mass",
              top_page_id: topPageId,
              top_page_university_id: topPageUniversityId,
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
          } catch (e) {
            const errorMessage =
              e instanceof Error ? e.message : "Unknown error";
            failed.push({ job, error: errorMessage });
          }
        }

        const data = { ok, skipped, failed };
        modalRegistry.massApplyResult.open({
          massApplyResultsData: data,
          clearSelection,
          setSelectMode,
        });
      } finally {
        isSubmittingRef.current = false;
      }
    },
    [
      selectedJobsList,
      jobStatus,
      profile.data,
      applicationActions,
      clearSelection,
      topPageId,
      topPageUniversityId,
    ],
  );

  const openMassApply = useCallback(() => {
    if (!isAuthenticated()) {
      savePostLoginRedirect(
        `${window.location.pathname}${window.location.search}`,
      );
      window.location.href = googleLoginUrl();
      return;
    }

    const allApplied =
      selectedJobsList.length > 0 &&
      selectedJobsList.every((j) => jobStatus.isJobApplied(j.id ?? ""));
    if (!selectedJobsList.length || allApplied) {
      toast.error(
        "No eligible jobs selected. Select jobs you haven’t applied to yet.",
      );
      return;
    }

    modalRegistry.completeProfileApply.open({
      profile: profile.data,
      applyLabel: `Apply to ${selectedJobs.size || 0}`,
      onApply: ({ resumeId }: ApplyPayload) => {
        void runMassApply(resumeId);
      },
    });
  }, [
    isAuthenticated,
    selectedJobsList,
    jobStatus,
    modalRegistry,
    profile.data,
    selectedJobs.size,
    runMassApply,
  ]);

  return {
    selectMode,
    setSelectMode,
    selectedJobs,
    selectedJobsList,
    toggleSelect,
    isSelected,
    clearSelection,
    selectAllOnPage,
    unselectAllOnPage,
    openMassApply,
    runMassApply,
  };
}
