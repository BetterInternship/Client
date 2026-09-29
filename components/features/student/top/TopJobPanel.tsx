"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@betterinternship/components";
import { Job, PublicUser } from "@/lib/db/db.types";
import { JobDetails } from "@/components/shared/jobs";
import { ApplyToJobButton } from "@/components/features/student/job/apply-to-job-button";
import { ShareJobButton } from "@/components/features/student/job/share-job-button";
import { SaveJobButton } from "@/components/features/student/job/save-job-button";
import type { ApplyPayload } from "@/components/modals/components/ApplyModal";

// Direction-aware slide for the panel's inner content only — the panel
// itself never re-animates when switching listings (see component body).
const contentVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 32 : -32, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -32 : 32, opacity: 0 }),
};

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
  disabled,
}: {
  job: Job;
  profile: PublicUser | null;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  onApply: (payload: ApplyPayload) => void | Promise<void>;
  disabled?: boolean;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [direction, setDirection] = useState(1);

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

  const handlePrev = () => {
    setDirection(-1);
    onPrev();
  };

  const handleNext = () => {
    setDirection(1);
    onNext();
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={job.title ?? "Listing details"}
      className="fixed inset-y-0 right-0 z-[100] flex w-full max-w-2xl flex-col border-l bg-white shadow-xl"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={!hasPrev}
            onClick={handlePrev}
            aria-label="Previous listing"
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!hasNext}
            onClick={handleNext}
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

      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={job.id}
            custom={direction}
            variants={contentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="flex h-full flex-col"
          >
            <JobDetails
              className="p-6"
              job={job}
              showCredited
              user={{
                github_link: profile?.github_link ?? null,
                portfolio_link: profile?.portfolio_link ?? null,
              }}
              actions={[
                <ShareJobButton job={job} key="share" disabled={disabled} />,
                <SaveJobButton job={job} key="save" disabled={disabled} />,
                <ApplyToJobButton
                  profile={profile}
                  job={job}
                  onApply={onApply}
                  key="apply"
                  disabled={disabled}
                />,
              ]}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
