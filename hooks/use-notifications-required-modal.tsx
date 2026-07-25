"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useModalRegistry } from "@/components/modals/modal-registry";
import { useUpdateMyNotifications } from "./use-employer-api";

/**
 * Opens the "no one receives applicant emails" blocker modal
 * (Docs/plans/DIGEST_UNSUBSCRIBE_MODAL_PLAN.md's inverse guard, surfaced via
 * jobs.controller.ts's `notifications_required` response code) with its CTA
 * wired to turn the CURRENT user's own digest flag on — the lowest-friction
 * fix, and always a plain success since turning the digest on never
 * warns/cascades (D7/D8). Kept out of use-employer-api.tsx: modal-registry.tsx's
 * digestOptout entry already imports from there, so importing it back would
 * be a cycle.
 *
 * `onEnabled` is the original blocked action (the is_active toggle, a single
 * unpause, or unpause-all) — it re-runs automatically once notifications are
 * confirmed on, so one click on the modal's CTA is enough to end with at
 * least one active listing, not just notifications turned on.
 */
export function useNotificationsRequiredModal() {
  const modalRegistry = useModalRegistry();
  const updateNotifications = useUpdateMyNotifications();

  return useCallback(
    (onEnabled?: () => void | Promise<void>) => {
      modalRegistry.notificationsRequired.open({
        onTurnOn: () => {
          void updateNotifications
            .mutateAsync({ receivesDigest: true })
            .then(async (result) => {
              if (!result.success) {
                toast.error(
                  result.message || "Could not turn on notifications.",
                );
                return;
              }
              toast.success("Notifications turned on.");
              await onEnabled?.();
            })
            .catch((e: unknown) => {
              toast.error(
                e instanceof Error ? e.message : "Could not turn on notifications.",
              );
            });
        },
      });
    },
    [modalRegistry, updateNotifications],
  );
}
