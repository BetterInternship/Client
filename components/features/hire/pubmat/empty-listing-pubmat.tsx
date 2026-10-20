"use client";

import { Ghost, ImageOff, RotateCw } from "lucide-react";
import { Button } from "@betterinternship/components";
import type { Job } from "@/lib/db/db.types";
import { useShareLink } from "@/lib/api/student.data.api";
import useModalRegistry from "@/components/modals/modal-registry";
import { ShareJobButton } from "../../student/job/share-job-button";
import { PubmatCreator } from "./pubmat-creator";

/**
 * What an employer sees on a listing nobody has applied to: the pubmat itself,
 * centred, with a download button and an Edit button that opens the modal for
 * choosing a layout — rather than a prompt to go and make one. The pubmat's QR
 * is the listing's short share link, so the page mints it on arrival — the
 * same call Share makes, which reuses an existing link instead of minting
 * another.
 */
export function EmptyListingPubmat({ job }: { job: Job }) {
  const modals = useModalRegistry();
  const { url, isPending, isError, refetch } = useShareLink(job.id);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 px-4 py-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <Ghost className="size-8 text-gray-400" />
        <h3 className="text-lg font-semibold">No applicants yet.</h3>
        <p className="text-sm text-gray-600">
          Post this on social media to get your listing in front of students.
          The QR code opens it on BetterInternship.
        </p>
      </div>

      {url ? (
        <PubmatCreator
          job={job}
          link={url}
          maxPreviewHeight={300}
          onEdit={() => modals.pubmat.open({ job, link: url })}
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
          className="aspect-square w-full max-w-[300px] animate-pulse rounded-[0.33em] bg-gray-100"
          aria-busy={isPending}
        />
      )}

      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-xs text-gray-500">Or just share the link</p>
        <ShareJobButton job={job} />
      </div>
    </div>
  );
}
