"use client";

import { Ghost, ImageOff, Megaphone, RotateCw } from "lucide-react";
import { Button } from "@betterinternship/components";
import { StatusNotice } from "@betterinternship/components/status-notice";
import { Shimmer } from "@/components/ui/shimmer";
import type { Job } from "@/lib/db/db.types";
import { useShareLink } from "@/lib/api/student.data.api";
import { usePubmatLogo } from "./use-pubmat-logo";
import { PubmatCreator } from "./pubmat-creator";
import { PubmatLogoPrompt } from "./pubmat-logo-prompt";

/**
 * Empty-listing preview with an optional inline logo step. The short share
 * link is reused for the poster's QR; logo upload never opens another modal.
 */
export function EmptyListingPubmat({ job }: { job: Job }) {
  const { url, isPending, isError, refetch } = useShareLink(job.id);
  const logo = usePubmatLogo();

  return (
    <div className="mx-auto flex w-full flex-col items-center gap-4 py-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <Ghost className="size-8 text-gray-400" />
        <h3 className="text-lg font-semibold">No applicants yet.</h3>
      </div>

      {/* Widen only when the desktop text editor is open. */}
      <div className="w-full max-w-[520px] rounded-[0.33em] border border-primary/25 bg-primary/[0.035] px-4 py-4 sm:px-5 lg:has-[.pubmat-editing]:max-w-[984px]">
        {logo.asking ? (
          <PubmatLogoPrompt onContinue={logo.continueWith} />
        ) : (
          <>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-[0.33em] bg-primary/5 text-primary">
                <Megaphone className="size-5" aria-hidden="true" />
              </span>
              {/* Same type as the logo step's heading (pubmat-logo-prompt.tsx),
                  so the card and the step it opens read as one flow. */}
              <h3 className="min-w-0 flex-1 text-xl font-semibold leading-snug tracking-tight text-gray-900">
                Share a poster of this listing on social media.
              </h3>
            </div>

            {logo.needsLogo && (
              <StatusNotice
                variant="warning"
                title="Add a logo so students know who’s hiring at a glance."
                action={
                  <Button variant="outline" size="sm" onClick={logo.ask}>
                    Add logo
                  </Button>
                }
                className="mb-4"
              />
            )}

            {/* The same presentation as the share sheet (pubmat-modal.tsx): the
                same preview size, and the editor beside it once there's room. */}
            <div className="flex justify-center">
              {url ? (
                <PubmatCreator
                  job={job}
                  link={url}
                  maxPreviewSize={400}
                  sideBySide
                  companyLogo={logo.companyLogo}
                />
              ) : isError ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <ImageOff className="size-8 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Couldn&apos;t get a link for this listing.
                  </p>
                  <Button variant="outline" onClick={() => void refetch()}>
                    <RotateCw />
                    Try again
                  </Button>
                </div>
              ) : (
                <div
                  className="relative aspect-square w-full max-w-[400px] overflow-hidden rounded-[0.33em]"
                  aria-busy={isPending}
                >
                  <Shimmer className="absolute inset-0" />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
