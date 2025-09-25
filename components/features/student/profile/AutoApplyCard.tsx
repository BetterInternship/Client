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
  onSave, // async (next: boolean) => Promise<void>
}: {
  initialEnabled: boolean;
  onSave: (next: boolean) => Promise<void>;
}) {
  const [enabled, setEnabled] = useState(!!initialEnabled);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);

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
    setPending(true);
    try {
      await onSave(true);
      setEnabled(true);
    } finally {
      setPending(false);
    }
  }

  function handleRequestDisable() {
    setConfirmOpen(true);
  }

  async function confirmDisable() {
    setPending(true);
    try {
      await onSave(false);
      setEnabled(false);
    } finally {
      setPending(false);
      setConfirmOpen(false);
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
              disabled={pending}
              aria-label="Apply for Me"
              onCheckedChange={(next) => {
                if (next) handleEnable();
                else handleRequestDisable();
              }}
            />
          </div>
        </div>

        {/* Longer explanation */}
        <div className={cn("text-xs leading-relaxed text-justify", tone.subtext)}>
          Automatically send your resume to matching companies. Just wait for the
          interview. Only companies that fit your profile will see your resume.
        </div>

        {enabled ? (
          <p className="text-sm text-emerald-800">Apply for Me is currently active.</p>
        ) : (
          <p className="text-sm text-red-800">Apply for Me is currently off.</p>
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
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            {/* Turn off */}
            <AlertDialogAction
              onClick={confirmDisable}
              disabled={pending}
              className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
            >
              Turn off — I’ll apply manually instead
            </AlertDialogAction>

            {/* Keep on */}
            <AlertDialogCancel
              disabled={pending}
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
