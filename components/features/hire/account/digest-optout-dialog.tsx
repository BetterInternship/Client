"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useDeactivateBulkJobs,
  useUpdateMyNotifications,
} from "@/hooks/use-employer-api";
import type { EligibleListing } from "@/lib/api/services";

interface DigestOptoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
  listings: EligibleListing[];
  /** Called after either action succeeds, so the caller can refetch whatever it needs (owned jobs, /me). */
  onDone: () => void;
}

/**
 * Warns before a digest opt-out would leave every active listing silently
 * unattended (Docs/plans/DIGEST_UNSUBSCRIBE_MODAL_PLAN.md §7.1). Mount-agnostic
 * (D14): only mounted from the Notifications tab today, but takes its data as
 * props so a future per-teammate toggle (§7.3) can reuse it unchanged.
 */
export function DigestOptoutDialog({
  open,
  onOpenChange,
  companyName,
  listings,
  onDone,
}: DigestOptoutDialogProps) {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const deactivateBulk = useDeactivateBulkJobs();
  const updateNotifications = useUpdateMyNotifications();

  // Boxes start unticked every time the dialog is (re-)opened with a new set (D11).
  useEffect(() => {
    if (open) setCheckedIds(new Set());
  }, [open]);

  const allChecked =
    listings.length > 0 && checkedIds.size === listings.length;
  const pending = deactivateBulk.isPending || updateNotifications.isPending;

  const toggleAll = () => {
    setCheckedIds(allChecked ? new Set() : new Set(listings.map((l) => l.id)));
  };

  const toggleOne = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCloseSelected = async () => {
    const ids = [...checkedIds];
    if (!ids.length) return;

    try {
      const response = await deactivateBulk.mutateAsync(ids);
      if (!response.success) {
        toast.error(response.message || "Could not close listings.");
        return;
      }
      const closedCount = response.job_ids?.length ?? 0;
      toast.success(
        `Closed ${closedCount} listing${closedCount === 1 ? "" : "s"}. You'll still get applicant emails for the rest.`,
      );
      onOpenChange(false);
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not close listings.");
    }
  };

  const handleTurnOffAnyway = async () => {
    try {
      const response = await updateNotifications.mutateAsync({
        receivesDigest: false,
        closeActiveListings: true,
      });
      if (!response.success) {
        toast.error(
          response.message || "Could not update notification settings.",
        );
        return;
      }
      const closedCount = response.closed_listing_ids?.length ?? listings.length;
      toast.success(
        `Applicant emails are off. ${closedCount} listing${closedCount === 1 ? "" : "s"} closed.`,
      );
      onOpenChange(false);
      onDone();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not update notification settings.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Turn off applicant emails?</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          You&apos;re the only person at {companyName} receiving these.
          Turning them off will also close{" "}
          {listings.length === 1
            ? "your active listing."
            : `all ${listings.length} of your active listings.`}
        </p>

        <div className="rounded-md border">
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Checkbox
              id="digest-optout-select-all"
              checked={allChecked}
              onCheckedChange={toggleAll}
            />
            <Label
              htmlFor="digest-optout-select-all"
              className="cursor-pointer text-sm font-medium text-gray-900"
            >
              Select all ({listings.length})
            </Label>
          </div>
          <ScrollArea className="max-h-56">
            <div className="divide-y">
              {listings.map((listing) => (
                <label
                  key={listing.id}
                  htmlFor={`digest-optout-${listing.id}`}
                  className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm"
                >
                  <Checkbox
                    id={`digest-optout-${listing.id}`}
                    checked={checkedIds.has(listing.id)}
                    onCheckedChange={() => toggleOne(listing.id)}
                  />
                  {listing.title}
                </label>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="flex-col items-stretch gap-2 sm:flex-col sm:items-stretch sm:space-x-0">
          <Button
            className="w-full cursor-pointer"
            disabled={checkedIds.size === 0 || pending}
            onClick={handleCloseSelected}
          >
            {deactivateBulk.isPending
              ? "Closing..."
              : "Close only these listings"}
          </Button>
          <Button
            variant="ghost"
            className="w-full cursor-pointer text-muted-foreground"
            disabled={pending}
            onClick={handleTurnOffAnyway}
          >
            {updateNotifications.isPending
              ? "Turning off..."
              : "Turn off all emails anyway"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
