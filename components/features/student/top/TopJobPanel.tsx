"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@betterinternship/components";
import { Job, PublicUser } from "@/lib/db/db.types";
import { JobDetails } from "@/components/shared/jobs";
import { ApplyToJobButton } from "@/components/features/student/job/apply-to-job-button";
import { ShareJobButton } from "@/components/features/student/job/share-job-button";
import { SaveJobButton } from "@/components/features/student/job/save-job-button";
import type { ApplyPayload } from "@/components/modals/components/ApplyModal";

/**
 * Desktop-only overlay panel (plan D15): slides over the page without the
 * grid behind it collapsing or reflowing. Closes with Esc or the X only — no
 * backdrop click, since the grid is meant to stay visible and unobstructed
 * (plan defaults). Prev/next walk the visible cards in page order and
 * disable at the ends rather than wrapping.
 */
export function TopJobPanel({
  job,
  profile,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onClose,
  onApply,
}: {
  job: Job;
  profile: PublicUser | null;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  onApply: (payload: ApplyPayload) => void | Promise<void>;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, [job.id]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={job.title ?? "Listing details"}
      className="fixed inset-y-0 right-0 z-[100] flex w-full max-w-xl flex-col border-l bg-white shadow-xl"
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={!hasPrev}
            onClick={onPrev}
            aria-label="Previous listing"
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!hasNext}
            onClick={onNext}
            aria-label="Next listing"
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <Button
          ref={closeButtonRef}
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Close"
          className="h-8 w-8 p-0"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <JobDetails
        className="p-6"
        job={job}
        user={{
          github_link: profile?.github_link ?? null,
          portfolio_link: profile?.portfolio_link ?? null,
        }}
        actions={[
          <ShareJobButton job={job} key="share" />,
          <SaveJobButton job={job} key="save" />,
          <ApplyToJobButton
            profile={profile}
            job={job}
            onApply={onApply}
            key="apply"
          />,
        ]}
      />
    </div>
  );
}
