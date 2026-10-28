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
import { useAuthContext } from "@/lib/ctx-student-auth";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

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
  notified?: boolean;
}

interface FilloutJobsApi {
  jobs: TrackedFilloutJob[];
  track: (jobId: string, label: string, timestamp?: string) => void;
  untrack: (jobId: string) => void;
}

const FilloutJobsContext = createContext<FilloutJobsApi | null>(null);

const readStoredJobs = (owner: string | null): TrackedFilloutJob[] => {
  if (typeof window === "undefined" || !owner) return [];
  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEY}:${owner}`);
    const value: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(value)) return [];
    return (value as unknown[]).filter((value): value is TrackedFilloutJob => {
      if (!value || typeof value !== "object") return false;
      const job = value as Record<string, unknown>;
      return (
        typeof job.jobId === "string" &&
        typeof job.label === "string" &&
        typeof job.timestamp === "string" &&
        Date.now() - Date.parse(job.timestamp) < 7 * 24 * 60 * 60 * 1000
      );
    });
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
  const owner = useAuthContext().user?.id ?? null;
  const client = useQueryClient();
  const router = useRouter();
  const [scope, setScope] = useState(() => ({
    owner,
    jobs: readStoredJobs(owner),
  }));
  if (scope.owner !== owner) setScope({ owner, jobs: readStoredJobs(owner) });
  const jobs = scope.owner === owner ? scope.jobs : [];
  const ownerRef = useRef(owner);
  ownerRef.current = owner;
  const setJobs = useCallback(
    (update: (previous: TrackedFilloutJob[]) => TrackedFilloutJob[]) => {
      setScope((previous) =>
        previous.owner === owner
          ? { owner, jobs: update(previous.jobs) }
          : previous,
      );
    },
    [owner],
  );
  const notified = useRef<Set<string>>(new Set());
  useEffect(
    () => () => {
      for (const id of notified.current) {
        if (id.startsWith(`${owner}:`)) {
          toast.dismiss(id);
          notified.current.delete(id);
        }
      }
    },
    [owner],
  );

  useEffect(() => {
    try {
      if (owner && scope.owner === owner) {
        window.localStorage.setItem(
          `${STORAGE_KEY}:${owner}`,
          JSON.stringify(jobs),
        );
      }
    } catch {
      // Best-effort; a full storage quota shouldn't break the fillout flow.
    }
  }, [jobs, owner, scope.owner]);

  const track = useCallback(
    (jobId: string, label: string, timestamp?: string) => {
      if (!owner || ownerRef.current !== owner) return;
      setJobs((prev) =>
        prev.some((job) => job.jobId === jobId)
          ? prev
          : [
              ...prev,
              {
                jobId,
                label,
                timestamp: timestamp ?? new Date().toISOString(),
              },
            ],
      );
    },
    [owner, setJobs],
  );

  const untrack = useCallback(
    (jobId: string) => {
      setJobs((prev) => prev.filter((job) => job.jobId !== jobId));
    },
    [setJobs],
  );

  const jobIds = useMemo(() => jobs.map((job) => job.jobId), [jobs]);
  const polled = useMQJobs<FilloutFormProcessResult>(jobIds);

  useEffect(() => {
    for (const entry of polled) {
      if (!entry.isDone && !entry.isFailed) continue;
      if (!owner || ownerRef.current !== owner) continue;
      if (!jobs.some((job) => job.jobId === entry.jobId)) continue;
      if (
        notified.current.has(`${owner}:${entry.jobId}`) ||
        jobs.find((job) => job.jobId === entry.jobId)?.notified
      )
        continue;
      notified.current.add(`${owner}:${entry.jobId}`);
      setJobs((previous) =>
        previous.map((job) =>
          job.jobId === entry.jobId ? { ...job, notified: true } : job,
        ),
      );

      const label =
        jobs.find((job) => job.jobId === entry.jobId)?.label ?? "form";
      if (entry.isDone) {
        toast.success(`Generated ${label}`, {
          id: `${owner}:${entry.jobId}`,
          duration: 2000,
          ...toastPresets.success,
          action: {
            label: "View forms",
            onClick: () => {
              router.push("/forms");
            },
          },
        });
        // Reconcile even when the Forms page is not mounted.
        void client
          .fetchQuery({
            queryKey: ["my-forms", owner],
            queryFn: () => FormService.getMyGeneratedForms(),
            staleTime: 0,
          })
          .then((forms) => {
            if (ownerRef.current !== owner) return;
            if (
              forms.some(
                (form) => form.form_process_id === entry.result?.formProcessId,
              )
            )
              untrack(entry.jobId);
          })
          .catch(() => {
            /* Keep tracking metadata for retry/normal Forms reconciliation. */
          });
      } else {
        toast.error(`Could not generate ${label}: ${entry.error}`, {
          id: `${owner}:${entry.jobId}`,
          duration: 2000,
          ...toastPresets.destructive,
        });
      }
    }
  }, [polled, owner, jobs, setJobs, client, untrack, router]);

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

/**
 * Tracks a job started elsewhere (docs-signing RabbitMQ migration plan §8.2:
 * `initiateForm` produces a *new* form process, the same synthetic-pending-
 * row case fillout already solves — so it reuses this provider's tracking
 * instead of duplicating it) rather than one this module started itself.
 */
export const useTrackFilloutJob = () => {
  const { track } = useFilloutJobsApi();
  return track;
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
      const formProcessId = entry.result?.formProcessId;
      if (!formProcessId) continue;
      if (myForms.forms.some((form) => form.form_process_id === formProcessId))
        untrack(entry.jobId);
    }
  }, [entries, myForms.forms, untrack]);

  return {
    get: (jobId: string) =>
      entries.find((entry) => entry.jobId === jobId) ?? null,
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
                form.form_process_id === handledForm.result?.formProcessId,
            ),
        )
        .map((handledForm) => ({
          label: handledForm.metadata?.metadata?.label ?? "",
          timestamp: handledForm.metadata?.metadata?.timestamp ?? "",
          downloadUrl: handledForm.result?.documentUrl ?? "",
          pending: false,
          // "done" here would mean *generation* done, but FormLog reads
          // `status` as the form process's own status ("pending" | "done" —
          // see registerSignatoryForm), where "done" means fully signed.
          // Generating the doc only gets it to its first signer, i.e. the
          // real row's eventual status once `myForms` catches up — so match
          // that instead of flashing a false "Completed" in between.
          status: "pending",
        })),
    [formFilloutProcessReader, myForms.forms],
  );
};
