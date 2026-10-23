"use client";

import type { Job } from "@/lib/db/db.types";
import { PubmatCreator } from "./pubmat-creator";

/**
 * The pubmat creator in a modal, which the listing header's Share button
 * (share-pubmat-button.tsx) opens. Content only — mounted through useModalRegistry().pubmat so it gets the
 * app's shared modal chrome.
 */
export function PubmatModal({ job, link }: { job: Job; link: string }) {
  return (
    <div className="flex flex-col gap-3 pt-2">
      <p className="text-sm text-gray-600">
        Post it anywhere. The QR code opens your listing on BetterInternship.
      </p>
      <PubmatCreator job={job} link={link} maxPreviewSize={400} />
    </div>
  );
}
