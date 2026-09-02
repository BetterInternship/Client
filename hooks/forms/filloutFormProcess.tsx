/**
 * @ Author: BetterInternship
 * @ Create Time: 2026-03-04 16:35:00
 * @ Modified time: 2026-08-30 00:00:00
 * @ Description:
 *
 * Client process implementation for the form fillout process. Broker
 * redesign plan §5.2/§9 step 5: polls `internal.mq_jobs` via
 * `useMQJobs` (Package.Components) instead of the orchestrator/orca. A
 * fillout job can outlive the component that started it (the signing modal
 * closes right after submit), so the tracked-job list lives in a small
 * root-mounted provider rather than local state — the same reason the old
 * `useClientProcess` needed `ClientProcessesProvider`.
 */

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMyForms } from "@/app/student/forms/myforms.ctx";
import { toastPresets } from "@/components/ui/sonner-toast";
import { FormService } from "@/lib/api/services";
import { useMQJobs } from "@betterinternship/components";
import { toast } from "sonner";

const formFilloutKey = "form-fillout";
const STORAGE_KEY = "bi.mq-jobs.form-fillout";

interface FilloutFormProcessResult {
  formId: string;
  formProcessId: string;
  documentId: string;
  documentUrl: string;
}

interface TrackedFilloutJob {
  jobId: string;
  label: string;
  timestamp: string;
}

interface FilloutJobsApi {
  jobs: TrackedFilloutJob[];
  track: (jobId: string, label: string, timestamp?: string) => void;
  untrack: (jobId: string) => void;
}

const FilloutJobsContext = createContext<FilloutJobsApi | null>(null);

const readStoredJobs = (): TrackedFilloutJob[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TrackedFilloutJob[]) : [];
  } catch {
    return [];
  }
};

/**
 * Mount once near the root (alongside the app's other providers). Tracks
 * in-flight fillout jobs across navigation and fires the completion toast
 * exactly once per job.
 */
export const FilloutJobsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [jobs, setJobs] = useState<TrackedFilloutJob[]>(readStoredJobs);
  const notified = useRef<Set<string>>(new Set());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    } catch {
      // Best-effort; a full storage quota shouldn't break the fillout flow.
    }
  }, [jobs]);

  const track = useCallback(
    (jobId: string, label: string, timestamp?: string) => {
      setJobs((prev) =>
        prev.some((job) => job.jobId === jobId)
          ? prev
          : [
              ...prev,
              { jobId, label, timestamp: timestamp ?? new Date().toISOString() },
            ],
      );
    },
    [],
  );

  const untrack = useCallback((jobId: string) => {
    notified.current.delete(jobId);
    setJobs((prev) => prev.filter((job) => job.jobId !== jobId));
  }, []);

  const jobIds = useMemo(() => jobs.map((job) => job.jobId), [jobs]);
  const polled = useMQJobs<FilloutFormProcessResult>(jobIds);

  useEffect(() => {
    for (const entry of polled) {
      if (!entry.isDone && !entry.isFailed) continue;
      if (notified.current.has(entry.jobId)) continue;
      notified.current.add(entry.jobId);

      const label =
        jobs.find((job) => job.jobId === entry.jobId)?.label ?? "form";
      if (entry.isDone) {
        toast.success(`Generated ${label}`, {
          id: entry.jobId,
          duration: 2000,
          ...toastPresets.success,
        });
      } else {
        toast.error(`Could not generate ${label}: ${entry.error}`, {
          id: entry.jobId,
          duration: 2000,
          ...toastPresets.destructive,
        });
      }
    }
    // `jobs` only supplies the label lookup; re-running per poll tick (not
    // per `jobs` change) is what lets this catch a status transition.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [polled]);

  const api = useMemo<FilloutJobsApi>(
    () => ({ jobs, track, untrack }),
    [jobs, track, untrack],
  );

  return (
    <FilloutJobsContext.Provider value={api}>
      {children}
    </FilloutJobsContext.Provider>
  );
};

const useFilloutJobsApi = () => {
  const ctx = useContext(FilloutJobsContext);
  if (!ctx)
    throw new Error(
      "Fillout hooks must be used within a <FilloutJobsProvider>.",
    );
  return ctx;
};

export const useFormFilloutProcessRunner = () => {
  const { track } = useFilloutJobsApi();

  const run = useCallback(
    async (
      data: Parameters<typeof FormService.filloutForm>[0],
      metadata?: { label?: string; timestamp?: string },
    ) => {
      const response = await FormService.filloutForm(data);
      if (response.success && response.jobId) {
        track(response.jobId, metadata?.label ?? "form", metadata?.timestamp);
        return { id: response.jobId, success: true, message: response.message };
      }
      return { id: null, success: false, message: response.message };
    },
    [track],
  );

  return { run };
};

export const useFormFilloutProcessReader = () => {
  const { jobs, untrack } = useFilloutJobsApi();
  const myForms = useMyForms();
  const jobIds = useMemo(() => jobs.map((job) => job.jobId), [jobs]);
  const polled = useMQJobs<FilloutFormProcessResult>(jobIds);

  const entries = useMemo(
    () =>
      polled.map((entry) => {
        const tracked = jobs.find((job) => job.jobId === entry.jobId);
        return {
          ...entry,
          metadata: {
            filterKey: formFilloutKey,
            metadata: {
              label: tracked?.label ?? "",
              timestamp: tracked?.timestamp ?? "",
            },
          },
        };
      }),
    [polled, jobs],
  );

  // Once a completed job's real row shows up in `myForms`, stop tracking
  // (and polling) it — mirrors the old reconciliation in page.tsx, just
  // moved here so it also stops the poll instead of only hiding the entry.
  useEffect(() => {
    for (const entry of entries) {
      if (!entry.isDone) continue;
      const formProcessId = (entry.result as FilloutFormProcessResult | undefined)
        ?.formProcessId;
      if (!formProcessId) continue;
      if (myForms.forms.some((form) => form.form_process_id === formProcessId))
        untrack(entry.jobId);
    }
  }, [entries, myForms.forms, untrack]);

  return {
    get: (jobId: string) => entries.find((entry) => entry.jobId === jobId) ?? null,
    getAll: () => entries,
    getAllPending: () => entries.filter((entry) => entry.isPending),
    getAllHandled: () => entries.filter((entry) => entry.isDone),
    getAllFailed: () => entries.filter((entry) => entry.isFailed),
  };
};

export const useFormFilloutProcessPending = () => {
  const myForms = useMyForms();
  const formFilloutProcessReader = useFormFilloutProcessReader();

  return useMemo(
    () =>
      formFilloutProcessReader.getAllPending().map((pendingJob) => ({
        label: pendingJob.metadata?.metadata?.label ?? "",
        timestamp: pendingJob.metadata?.metadata?.timestamp ?? "",
        pending: true,
      })),
    [formFilloutProcessReader, myForms.forms],
  );
};

export const useFormFilloutProcessHandled = () => {
  const myForms = useMyForms();
  const formFilloutProcessReader = useFormFilloutProcessReader();

  return useMemo(
    () =>
      formFilloutProcessReader
        .getAllHandled()
        .filter(
          (handledForm) =>
            !myForms.forms.some(
              (form) =>
                form.form_process_id ===
                (handledForm.result as FilloutFormProcessResult | undefined)
                  ?.formProcessId,
            ),
        )
        .map((handledForm) => ({
          label: handledForm.metadata?.metadata?.label ?? "",
          timestamp: handledForm.metadata?.metadata?.timestamp ?? "",
          downloadUrl: (handledForm.result as FilloutFormProcessResult)
            .documentUrl,
          pending: false,
          status: "done",
        })),
    [formFilloutProcessReader, myForms.forms],
  );
};
