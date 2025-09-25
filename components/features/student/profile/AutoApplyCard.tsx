"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch"; // shadcn
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
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium">Auto-Apply</div>
          </div>
          <Switch
            checked={enabled}
            disabled={pending}
            onCheckedChange={(next) => {
              if (next) handleEnable();
              else handleRequestDisable();
            }}
          />
        </div>

        {/* Longer explanation */}
        <div className="text-xs text-muted-foreground leading-relaxed">
          When Auto-Apply is <span className="font-medium">ON</span>, we’ll
          automatically submit your resume and profile to jobs that match your
          preferences (work mode, type, and role). You’ll save time by applying
          in bulk.
        </div>

        {enabled && (
          <p className="text-sm text-emerald-700">
            Auto-Apply is currently active.
          </p>
        )}
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Turn off Auto-Apply?</AlertDialogTitle>
            <AlertDialogDescription>
              Applications will no longer be sent automatically. You can turn it
              back on anytime in your profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDisable} disabled={pending}>
              Yes, turn it off
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
