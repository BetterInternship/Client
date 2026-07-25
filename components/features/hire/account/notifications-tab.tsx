"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  useMe,
  useOwnedJobs,
  useProfile,
  useUpdateMyNotifications,
} from "@/hooks/use-employer-api";
import { DigestOptoutDialog } from "./digest-optout-dialog";
import type { EligibleListing } from "@/lib/api/services";

export function NotificationsTab() {
  const { loading, data: me } = useMe();
  const { data: employer } = useProfile();
  const { ownedJobs, refetch: refetchOwnedJobs } = useOwnedJobs();
  const updateNotifications = useUpdateMyNotifications();
  const [dialogListings, setDialogListings] = useState<EligibleListing[] | null>(
    null,
  );

  // Client-side estimate for display only — the server always re-derives the
  // authoritative eligible set at confirm time (plan §6.3/§7.2).
  const eligibleListings = useMemo<EligibleListing[]>(
    () =>
      ownedJobs
        .filter((job) => job.is_active === true && !job.paused)
        .map((job) => ({
          id: job.id as string,
          title: job.title || "Untitled listing",
        })),
    [ownedJobs],
  );

  if (loading || !me) {
    return <Card className="p-6 text-sm text-muted-foreground">Loading...</Card>;
  }

  const handleCheckedChange = async (checked: boolean) => {
    if (checked) {
      // Turning the digest on never warns (D7/D8 only gate turning it off).
      updateNotifications.mutate({ receivesDigest: true });
      return;
    }

    const isLastSubscriber = (me.other_subscribed_recipients ?? 0) === 0;
    if (!isLastSubscriber || eligibleListings.length === 0) {
      // Safe to apply directly — but this is also the stale-client safety
      // net: if the server's fresher count disagrees, it 409s with its own
      // listing set instead of applying, and that set is what we show.
      const result = await updateNotifications.mutateAsync({
        receivesDigest: false,
      });
      if (result.eligible_listings?.length) {
        setDialogListings(result.eligible_listings);
      }
      return;
    }

    // Last subscriber with active listings — nothing is written until the
    // dialog resolves (D5).
    setDialogListings(eligibleListings);
  };

  const handleDialogDone = () => {
    setDialogListings(null);
    refetchOwnedJobs();
  };

  return (
    <>
      <Card className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="applicant-digest" className="text-sm font-medium text-gray-900">
              Daily applicant digest
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Get an email whenever your listings receive new applicants.
            </p>
          </div>
          <Switch
            id="applicant-digest"
            checked={me.receives_applicant_digest}
            disabled={updateNotifications.isPending}
            onCheckedChange={handleCheckedChange}
          />
        </div>
      </Card>

      <DigestOptoutDialog
        open={dialogListings !== null}
        onOpenChange={(open) => !open && setDialogListings(null)}
        companyName={employer?.name || "your company"}
        listings={dialogListings ?? []}
        onDone={handleDialogDone}
      />
    </>
  );
}
