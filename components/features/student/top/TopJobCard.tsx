"use client";

import Link from "next/link";
import { Clock, HeartCrack } from "lucide-react";
import { Badge, Card, cn } from "@betterinternship/components";
import { Job, PublicUser } from "@/lib/db/db.types";
import { JobBadges, JobHead, JobLocation } from "@/components/shared/jobs";
import { ApplyToJobButton } from "@/components/features/student/job/apply-to-job-button";
import { FormCheckbox } from "@/components/EditForm";
import { useWaitlistsData } from "@/lib/api/student.data.api";
import { formatListingAge } from "@/lib/utils/relative-age";
import type { ApplyPayload } from "@/components/modals/components/ApplyModal";

/**
 * A Top page grid card (plan D13/D15). No nested interactive elements: the
 * title sits in a single `<a href="/search/<id>">` whose `::after` is
 * stretched across the whole card (`relative` on the Card is the positioning
 * root), so the card is clickable everywhere except where the checkbox and
 * Apply button — positioned siblings, `relative z-10` — paint on top of it.
 * A plain left click opens the panel instead of navigating; ctrl/cmd/shift
 * click and crawlers get the real job page.
 */
export function TopJobCard({
  job,
  index,
  profile,
  selected,
  onOpen,
  isSelected,
  onToggleSelect,
  onApply,
  disabled,
}: {
  job: Job;
  index?: number;
  profile: PublicUser | null;
  selected: boolean;
  onOpen: () => void;
  isSelected: boolean;
  onToggleSelect: (job: Job) => void;
  onApply: (payload: ApplyPayload) => void | Promise<void>;
  disabled?: boolean;
}) {
  const waitlists = useWaitlistsData();
  const onAlert = waitlists.isWaitlisted(job.id);
  const age = formatListingAge(job.last_activated_at);

  return (
    <Card
      className={cn(
        "relative isolate flex flex-col gap-3 overflow-hidden px-6 py-6 transition-all duration-200 motion-safe:animate-fade-in",
        selected
          ? "ring-1 ring-primary ring-offset-1"
          : "hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-28px_rgba(15,23,42,0.45)]",
      )}
      style={{
        animationDelay: `${Math.min(index ?? 0, 8) * 45}ms`,
        animationFillMode: "backwards",
      }}
    >
      {/* FormCheckbox doesn't forward a `disabled` prop to its underlying
          Radix checkbox, so a hibernating card's box is disabled visually
          and functionally via this wrapper instead — clicking it can never
          reach onToggleSelect (which itself skips hibernating jobs too).
          top-6/right-6 line up with the Card's own px-6/py-6 padding, since
          an absolutely-positioned child offsets from the padding edge rather
          than the content edge those values imply for normal-flow siblings. */}
      <div
        className={cn(
          "absolute right-6 top-6 z-10",
          job.hibernating && "pointer-events-none opacity-40",
        )}
      >
        <FormCheckbox checked={isSelected} setter={() => onToggleSelect(job)} />
      </div>

      {job.hibernating && (
        <Badge
          variant="solid"
          type={onAlert ? "primary" : "warning"}
          className="flex w-fit items-center gap-1"
        >
          {onAlert ? (
            <Clock className="w-3 h-3" />
          ) : (
            <HeartCrack className="w-3 h-3" />
          )}
          {onAlert ? "Waiting..." : "Just missed"}
        </Badge>
      )}

      <Link
        href={`/search/${job.id}`}
        prefetch={false}
        className="static pr-8 after:absolute after:inset-0 after:content-['']"
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey) return;
          e.preventDefault();
          onOpen();
        }}
      >
        <JobHead
          title={job.title}
          employer={job.employer?.name}
          wrap={!!job.hibernating}
        />
      </Link>

      <JobLocation location={job.location} />
      <JobBadges job={job} excludes={["moa"]} />
      {age && <p className="text-xs text-muted-foreground">{age}</p>}

      <div className="relative z-10 mt-auto flex items-center justify-end gap-2 pt-1">
        <ApplyToJobButton
          profile={profile}
          job={job}
          onApply={onApply}
          disabled={disabled}
        />
      </div>
    </Card>
  );
}
