"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { ImageOff } from "lucide-react";
import { StatusNotice } from "@betterinternship/components/status-notice";
import { Shimmer } from "@/components/ui/shimmer";
import useModalRegistry from "@/components/modals/modal-registry";
import { useShareLink } from "@/lib/api/student.data.api";
import type { Job } from "@/lib/db/db.types";
import { SharePubmatButton } from "./share-pubmat-button";
import { usePubmatImage } from "./use-pubmat-image";

/**
 * What an employer sees under their applicants: a nudge to share the listing,
 * with a small copy of its pubmat leaning out over the top edge. The preview
 * and the Share button both open the pubmat modal.
 *
 * The pubmat is the expensive bit — it's drawn in the browser — and this sits
 * at the bottom of a table that can be long, so neither it nor the share link
 * it needs is fetched until the notice is close to the screen.
 */
export function ShareListingNotice({ job }: { job: Job }) {
  const modals = useModalRegistry();
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { once: true, margin: "0px 0px 240px 0px" });
  const { url } = useShareLink(near ? job.id : undefined);
  const { image, status } = usePubmatImage(job, url);

  return (
    // Room above for the preview to lean into.
    <div ref={ref} className="relative mb-6 mt-6 pt-6">
      <button
        type="button"
        aria-label="Open your pubmat"
        disabled={!url}
        onClick={() => url && modals.pubmat.open({ job, link: url })}
        className="absolute top-0 left-4 z-10 block aspect-square w-36 -rotate-3 cursor-pointer overflow-hidden rounded-[0.33em] border border-gray-200 bg-gray-50 shadow-lg transition-transform duration-200 hover:-rotate-1 hover:scale-105 disabled:cursor-default motion-reduce:transition-none sm:left-5 sm:w-24"
      >
        {image ? (
          <img
            src={image.url}
            alt=""
            draggable={false}
            className="size-full object-cover"
          />
        ) : status === "error" ? (
          <span className="flex size-full items-center justify-center">
            <ImageOff className="size-5 text-gray-400" />
          </span>
        ) : (
          <Shimmer className="relative size-full" />
        )}
      </button>

      <StatusNotice
        title="Get more applicants"
        description="Share a ready-made poster of this listing on social media."
        action={
          <SharePubmatButton
            job={job}
            variant="outline"
            size="md"
            scheme="primary"
            className="w-full sm:w-auto"
          />
        }
        // The preview takes the left on wider screens, and the top on narrow
        // ones, where the notice stacks.
        className="pt-32 sm:pt-4 sm:pl-36"
      />
    </div>
  );
}
