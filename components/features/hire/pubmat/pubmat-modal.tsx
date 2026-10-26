"use client";

import type { Job } from "@/lib/db/db.types";
import { PubmatCreator } from "./pubmat-creator";
import { useState } from "react";
import { Button } from "@betterinternship/components";
import { LoaderCircle } from "lucide-react";
import { usePfpUrl } from "@/hooks/use-pfp";
import { useAuthContext } from "@/app/hire/authctx";
import { PubmatLogoPrompt } from "./pubmat-logo-prompt";

/**
 * The pubmat creator in a modal, which the listing header's Share button
 * (share-pubmat-button.tsx) opens. Content only — mounted through useModalRegistry().pubmat so it gets the
 * app's shared modal chrome.
 */
export function PubmatModal({ job, link }: { job: Job; link: string }) {
  return (
    <SharePubmatFlow
      key={`${job.id ?? "listing"}-${link}`}
      job={job}
      link={link}
    />
  );
}

function SharePubmatFlow({ job, link }: { job: Job; link: string }) {
  const { user } = useAuthContext();
  // The sheet is only ever opened for the viewer's own listing, so the logo is
  // this employer's — "me", like the hire header resolves it.
  const profileLogo = usePfpUrl({
    id: "me",
    source: "employer",
    enabled: !!user,
  });
  const [choice, setChoice] = useState<{ logo: string | null } | null>(null);
  const ready = choice !== null || !!profileLogo.url;
  if (!ready && profileLogo.loading)
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
          onClick={() => setChoice({ logo: null })}
        >
          Continue without logo
        </Button>
      </div>
    );
  if (!ready)
    return <PubmatLogoPrompt onContinue={(logo) => setChoice({ logo })} />;
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
        companyLogo={choice ? choice.logo : profileLogo.url}
      />
    </div>
  );
}
