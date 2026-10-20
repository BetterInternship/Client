"use client";

import type { Job } from "@/lib/db/db.types";
import { PubmatCreator } from "./pubmat-creator";

/**
 * The pubmat creator in a modal, for the share sheet's "Create pubmat" action.
 * Content only — mounted through useModalRegistry().pubmat so it gets the
 * app's shared modal chrome.
 */
export function PubmatModal({ job, link }: { job: Job; link: string }) {
  return (
    <div className="flex flex-col gap-3 pt-2">
      <p className="text-sm text-gray-600">
        Pick a layout for where you&apos;ll post it. The QR code opens your
        listing on BetterInternship.
      </p>
      <PubmatCreator job={job} link={link} maxPreviewHeight={400} />
    </div>
  );
}
