"use client";

import { useState } from "react";
import { Check, Copy, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useShareLink } from "@/lib/api/student.data.api";
import { Job } from "@/lib/db/db.types";

interface ShareJobModalProps {
  job: Job;
}

/**
 * Mint fires on mount (via useShareLink) and the URL only ever appears once
 * it has one — a job never falls back to the long URL on failure
 * (Docs/plans/JOB_SHORT_LINKS_IMPLEMENTATION_PLAN.md D13). The copy handler
 * stays synchronous so it works on Safari too (D12): by the time it's
 * clicked, the string is already sitting in `url`.
 */
export function ShareJobModal({ job }: ShareJobModalProps) {
  const { url, isPending, isError, refetch } = useShareLink(job.id);
  const [copied, setCopied] = useState(false);

  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  const handleCopy = () => {
    if (!url) return;
    void navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleShare = () => {
    if (!url) return;
    void navigator.share({ title: job.title ?? undefined, url });
  };

  if (isError) {
    return (
      <div className="flex flex-col gap-3 pt-2">
        <p className="text-sm text-destructive">
          Couldn&apos;t generate a link.
        </p>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => void refetch()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pt-4">
      <div className="flex">
        <Input
          readOnly
          value={url ?? ""}
          placeholder={isPending ? "Generating link..." : undefined}
          onFocus={(e) => e.target.select()}
          className="rounded-r-none border-r-0 text-gray-700"
        />
        <Button
          variant="outline"
          disabled={isPending || !url}
          onClick={handleCopy}
          aria-label="Copy link"
          className="shrink-0 rounded-l-none px-3"
        >
          {isPending ? (
            <Loader2 className="animate-spin" />
          ) : copied ? (
            <Check className="text-supportive" />
          ) : (
            <Copy />
          )}
        </Button>
      </div>

      {/* Breaks out of the modal's own px-4/pb-4 to read as a footer bar
          flush with the panel's bottom (and, on desktop, its bottom
          corners) rather than a button floating in the content area. */}
      {canShare && (
        <Button
          variant="outline"
          disabled={isPending || !url}
          onClick={handleShare}
          className="-mx-4 -mb-4 h-auto w-[calc(100%+2rem)] rounded-none border-x-0 border-b-0 border-t py-3 sm:rounded-b-[0.33em]"
        >
          <Send />
          Send…
        </Button>
      )}
    </div>
  );
}
