"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@betterinternship/components";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useDeactivateBulkJobs,
  useUpdateMyNotifications,
} from "@/hooks/use-employer-api";
import type { EligibleListing } from "@/lib/api/services";

interface DigestOptoutModalContentProps {
  companyName: string;
  listings: EligibleListing[];
  /** Called after either action succeeds, so the caller can refetch whatever it needs (owned jobs, /me) and close the modal. */
  onDone: () => void;
}

/**
 * Warns before a digest opt-out would leave every active listing silently
 * unattended (Docs/plans/DIGEST_UNSUBSCRIBE_MODAL_PLAN.md §7.1). Content only
 * — mounted through useModalRegistry().digestOptout (modal-registry.tsx) so it
 * gets the app's shared backdrop/panel chrome instead of a bespoke one, and is
 * mount-agnostic (D14): a future per-teammate toggle (§7.3) can open it the
 * same way from the Team tab.
 */
export function DigestOptoutModalContent({
  companyName,
  listings,
  onDone,
}: DigestOptoutModalContentProps) {
  // Unticked by default (D11) — a fresh mount every time the registry opens
  // this modal, so there's no stale selection to reset between opens.
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const deactivateBulk = useDeactivateBulkJobs();
  const updateNotifications = useUpdateMyNotifications();

  const allChecked = listings.length > 0 && checkedIds.size === listings.length;
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
      const closedCount =
        response.closed_listing_ids?.length ?? listings.length;
      toast.success(
        `Applicant emails are off. ${closedCount} listing${closedCount === 1 ? "" : "s"} closed.`,
      );
      onDone();
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Could not update notification settings.",
      );
    }
  };

  return (
    <div className="flex flex-col gap-3 pt-4">
      <p className="text-sm text-gray-600">
        You&apos;re the only person at {companyName} receiving emails.
        <br />
        Turning them off will also close{" "}
        {listings.length === 1
          ? "your active listing."
          : `all ${listings.length} of your active listings.`}
      </p>

      {/* A toolbar, not a list row: no checkbox, opposite alignment, and an
          accent-colored action so it can't be mistaken for one of the items
          below it. */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          {checkedIds.size > 0
            ? `${checkedIds.size} of ${listings.length} selected`
            : `${listings.length} active listing${listings.length === 1 ? "" : "s"}`}
        </span>
        <button
          type="button"
          onClick={toggleAll}
          className="cursor-pointer text-sm font-medium text-primary hover:underline"
        >
          {allChecked ? "Deselect all" : "Select all"}
        </button>
      </div>

      <ScrollArea className="max-h-56 rounded-[0.33em] border">
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

      <div className="mt-3 flex flex-col gap-1">
        <Button
          variant="outline"
          className="w-full cursor-pointer text-muted-foreground"
          disabled={pending}
          onClick={handleTurnOffAnyway}
        >
          {updateNotifications.isPending
            ? "Turning off..."
            : "Close all listings and turn off emails"}
        </Button>
        <Button
          className="w-full cursor-pointer"
          disabled={checkedIds.size === 0 || pending}
          onClick={handleCloseSelected}
        >
          {deactivateBulk.isPending
            ? "Closing..."
            : "Close only these listings"}
        </Button>
      </div>
    </div>
  );
}
