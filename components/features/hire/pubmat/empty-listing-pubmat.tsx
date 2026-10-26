"use client";

import { useState } from "react";
import { Ghost, ImageOff, Megaphone, RotateCw } from "lucide-react";
import { Button } from "@betterinternship/components";
import { StatusNotice } from "@betterinternship/components/status-notice";
import { Shimmer } from "@/components/ui/shimmer";
import { useAuthContext } from "@/app/hire/authctx";
import type { Job } from "@/lib/db/db.types";
import { useShareLink } from "@/lib/api/student.data.api";
import { usePfpUrl } from "@/hooks/use-pfp";
import { PubmatCreator } from "./pubmat-creator";
import { PubmatLogoPrompt } from "./pubmat-logo-prompt";

/**
 * What an employer sees on a listing nobody has applied to: the pubmat itself,
 * with buttons to download it or share it to a platform — rather than a prompt
 * to go and make one. The pubmat's QR is the listing's short share link, so the
 * page mints it on arrival — the same call Share makes, which reuses an
 * existing link instead of minting another.
 *
 * Unlike the share sheet, this can't stop on the way in to ask for a logo, so
 * the poster carries the company name instead until you say otherwise: a notice
 * offers to add one, and taking it up swaps the poster for the sheet's own logo
 * step (pubmat-logo-prompt.tsx) right here, rather than sending you elsewhere.
 */
export function EmptyListingPubmat({ job }: { job: Job }) {
  const { url, isPending, isError, refetch } = useShareLink(job.id);
  const { user } = useAuthContext();

  // A dashboard pubmat is always the viewer's own listing, so the company logo
  // is this employer's — asked for as "me", the way the hire header does
  // (app-header.tsx). The job's employer id does not resolve here.
  const logo = usePfpUrl({
    id: "me",
    source: "employer",
    enabled: !!user,
  });
  const noLogo = !logo.loading && !logo.url;

  // "Asking" replaces the poster with the logo step. Once answered, `choice`
  // remembers the answer so the notice doesn't come back: null means they'd
  // rather keep the company name.
  const [asking, setAsking] = useState(false);
  const [choice, setChoice] = useState<{ logo: string | null }>();

  return (
    <div className="mx-auto flex w-full flex-col items-center gap-4 py-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <Ghost className="size-8 text-gray-400" />
        <h3 className="text-lg font-semibold">No applicants yet.</h3>
        <p className="text-sm text-gray-600">
          Post this on social media to get your listing in front of students.
          The QR code opens it on BetterInternship.
        </p>
      </div>

      {/* The generator wears a StatusNotice's border and tint (see
          share-listing-notice.tsx), so the poster reads as part of the same
          family as the dashboard's other notices. The card hugs the poster
          rather than the page, and only widens when the editor opens. */}
      <div className="w-full max-w-[520px] rounded-[0.33em] border border-primary/25 bg-primary/[0.035] px-4 py-4 sm:px-5 lg:has-[.pubmat-editing]:max-w-[984px]">
        {asking ? (
          <PubmatLogoPrompt
            onContinue={(next) => {
              setChoice({ logo: next });
              setAsking(false);
            }}
          />
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

            {noLogo && !choice && (
              <StatusNotice
                variant="warning"
                title="Add a logo so students know who’s hiring at a glance."
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAsking(true)}
                  >
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
                  companyLogo={choice ? choice.logo : undefined}
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
