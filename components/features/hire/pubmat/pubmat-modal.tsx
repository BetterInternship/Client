"use client";

import type { Job } from "@/lib/db/db.types";
import { PubmatCreator } from "./pubmat-creator";
import { Button } from "@betterinternship/components";
import { LoaderCircle } from "lucide-react";
import { usePubmatLogo } from "./use-pubmat-logo";
import { PubmatLogoPrompt } from "./pubmat-logo-prompt";
import { DEFAULT_PUBMAT_DESIGN, type PubmatDesign } from "@/lib/pubmat/designs";

/**
 * The pubmat creator in a modal, opened from the listing header's Share button
 * or the dashboard preview's Edit poster action. Content only — mounted through
 * useModalRegistry().pubmat so it gets the app's shared modal chrome.
 */
export function PubmatModal({
  job,
  link,
  startInEditor = false,
  initialDesign = DEFAULT_PUBMAT_DESIGN,
}: {
  job: Job;
  link: string;
  startInEditor?: boolean;
  initialDesign?: PubmatDesign;
}) {
  return (
    <SharePubmatFlow
      key={`${job.id ?? "listing"}-${link}-${startInEditor}-${initialDesign}`}
      job={job}
      link={link}
      startInEditor={startInEditor}
      initialDesign={initialDesign}
    />
  );
}

function SharePubmatFlow({
  job,
  link,
  startInEditor,
  initialDesign,
}: {
  job: Job;
  link: string;
  startInEditor: boolean;
  initialDesign: PubmatDesign;
}) {
  const logo = usePubmatLogo();
  if (logo.loading)
    return (
      <div className="flex min-h-56 flex-col items-center justify-center gap-4 py-6 text-center">
        <p
          className="flex items-center gap-2 text-sm text-gray-600"
          role="status"
        >
          <LoaderCircle
            className="size-4 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
          Checking your company logo…
        </p>
        <Button
          type="button"
          variant="ghost"
          onClick={() => logo.continueWith(null)}
        >
          Continue without logo
        </Button>
      </div>
    );
  if (logo.needsLogo)
    return <PubmatLogoPrompt onContinue={logo.continueWith} />;
  return (
    <div className="flex flex-col gap-3 pt-2">
      <p className="text-sm text-gray-600">
        Post it anywhere. The QR code opens your listing on BetterInternship.
      </p>
      <PubmatCreator
        job={job}
        link={link}
        maxPreviewSize={400}
        sideBySide
        companyLogo={logo.companyLogo}
        initiallyEditing={startInEditor}
        initialDesign={initialDesign}
      />
    </div>
  );
}
