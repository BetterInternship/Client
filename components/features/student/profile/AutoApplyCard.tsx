"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/landingHire/ui/alert-dialog";

export function AutoApplyCard({
  initialEnabled,
  enabledAt,
  onSave,
  saving,
  error,
}: {
  initialEnabled: boolean;
  enabledAt: string | null;
  onSave: (next: boolean) => Promise<void>;
  saving?: boolean;
  error?: string | null;
}) {
  const [enabled, setEnabled] = useState(!!initialEnabled);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const daysRemaining = useMemo(() => {
      if (!enabled || !enabledAt) return 0;

      const enabledDate = new Date(enabledAt)
      const endDate = new Date(enabledDate.getTime() + (14 * 24 * 60 * 60 * 1000))
      const dateNow = new Date()
      const daysLeft = Math.ceil((endDate.getTime() - dateNow.getTime())/ (24 * 60 * 60 * 1000))

      console.log("  endDate:", endDate);
      console.log("  dateNow:", dateNow);
      console.log("  daysLeft:", daysLeft);

      return Math.max(0, daysLeft);
    }, [enabled, enabledAt])

  const isBusy = pending || !!saving;

  const tone = useMemo(
    () =>
      enabled
        ? {
            card: "bg-emerald-50 border-emerald-200",
            heading: "text-emerald-900",
            subtext: "text-emerald-700",
            pill: "bg-transparent border-emerald-700 text-emerald-700",
          }
        : {
            card: "bg-red-50 border-red-200",
            heading: "text-red-900",
            subtext: "text-red-700",
            pill: "bg-transparent border-red-700 text-red-700",
          },
    [enabled]
  );

  async function handleEnable() {
    setLocalError(null);
    setPending(true);

    // Optimistic UI
    const prev = enabled;
    setEnabled(true);

    try {
      await onSave(true);
    } catch (e: any) {
      // Roll back on failure
      setEnabled(prev);
      setLocalError(e?.message ?? "Failed to enable Apply for Me.");
    } finally {
      setPending(false);
    }
  }

  function handleRequestDisable() {
    // Do not flip yet; keep switch ON until confirmed
    setConfirmOpen(true);
  }

  async function confirmDisable() {
    setLocalError(null);
    setPending(true);

    try {
      await onSave(false);
      setEnabled(false);
      setConfirmOpen(false);
    } catch (e: any) {
      setLocalError(e?.message ?? "Failed to turn off Apply for Me.");
      // Keep dialog open so user sees the error; user can dismiss
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Card
        className={cn(
          "p-4 space-y-3 border transition-colors duration-300 ease-out",
          tone.card
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className={cn("text-base font-semibold", tone.heading)}>
              Apply for Me
            </h3>
            <Badge className={cn("text-xs", tone.pill)}>Recommended</Badge>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={enabled}
              disabled={isBusy}
              aria-label="Apply for Me"
              onCheckedChange={(next) => {
                if (next) handleEnable();
                else handleRequestDisable();
              }}
            />
          </div>
        </div>

        {/* Explanation */}
        <div className={cn("text-xs leading-relaxed text-justify", tone.subtext)}>
          Automatically send your resume to matching companies. Only companies that fit
          your profile will see your resume. 
        </div>

        {/* Status */}
        {enabled ? (
          <p className="text-sm text-emerald-800">
            {daysRemaining > 0 ? 
            (isBusy ? "Saving…" : `Apply for Me is currently active, ${daysRemaining} days remaining.`) :
              "Apply for Me has expired."}
          </p>
        ) : (
          <p className="text-sm text-red-800">
            {isBusy ? "Saving…" : "Apply for Me is currently off."}
          </p>
        )}

        {/* Errors */}
        {(error || localError) && (
          <p className="text-xs text-red-600" aria-live="polite">
            {error || localError}
          </p>
        )}
      </Card>

      {/* Turn off confirmation */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Turn off Apply for Me?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              Don’t worry — we only apply to companies that fit your profile. Keep this on
              to get interviews faster.
              {(error || localError) && (
                <div className="text-red-600 text-xs">{error || localError}</div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            {/* Turn off */}
            <AlertDialogAction
              onClick={confirmDisable}
              disabled={isBusy}
              className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
            >
              {isBusy ? "Turning off…" : "Turn off — I’ll apply manually instead"}
            </AlertDialogAction>

            {/* Keep on */}
            <AlertDialogCancel
              disabled={isBusy}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Keep it on
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
