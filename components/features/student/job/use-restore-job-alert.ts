"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import type { useWaitlistActions } from "@/lib/api/student.actions.api";
import { consumeJobLoginIntent } from "@/lib/student-login";

/**
 * Completes an Alert requested before login once the caller's data is ready.
 * Both alert surfaces share this logic and consume the same intent, so only
 * one joins. Existing alerts and applications are left unchanged.
 */
export function useRestoreJobAlert({
  jobId,
  ready,
  onAlert,
  applied,
  join,
}: {
  jobId: string | undefined;
  ready: boolean;
  onAlert: boolean;
  applied: boolean;
  join: ReturnType<typeof useWaitlistActions>["join"]["mutateAsync"];
}) {
  useEffect(() => {
    if (!ready || !jobId) return;
    if (!consumeJobLoginIntent("alert", jobId) || onAlert || applied) return;
    void join(jobId)
      .then((response) => {
        if (response.success === false || response.message)
          throw new Error(response.message || "Could not enable alert");
        toast.success("Alert set.");
      })
      .catch(() =>
        toast.error("Couldn't enable your alert. Please try again."),
      );
  }, [jobId, ready, onAlert, applied, join]);
}
