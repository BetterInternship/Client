"use client";

import Link from "next/link";
import { Clock, HeartCrack } from "lucide-react";
import { Badge, Card, cn } from "@betterinternship/components";
import { FormCheckbox } from "@/components/EditForm";
import {
  CreditedBadge,
  EmployerMOA,
  JobBadges,
  JobHead,
  JobLocation,
} from "@/components/shared/jobs";
import { Job, PublicUser } from "@/lib/db/db.types";
import { ApplyToJobButton } from "@/components/features/student/job/apply-to-job-button";
import { SaveJobButton } from "@/components/features/student/job/save-job-button";
import ReactMarkdown from "react-markdown";
import { useWaitlistsData } from "@/lib/api/student.data.api";
import { formatListingAge } from "@/lib/utils/relative-age";
import type { ApplyPayload } from "@/components/modals/components/ApplyModal";
import motionStyles from "./top-motion.module.css";

/**
 * A Top page grid card (plan D13/D15). No nested interactive elements: the
 * title sits in a single `<a href="/search/<id>">` whose `::after` is
 * stretched across the whole card (`relative` on the Card is the positioning
 * root), so the card is clickable everywhere except where the heart and
 * Apply button — positioned siblings, `relative z-10` — paint on top of it.
 * A plain left click opens the panel instead of navigating; ctrl/cmd/shift
 * click and crawlers get the real job page.
 */
export function TopJobCard({
  job,
  profile,
  selected,
  onOpen,
  onApply,
  disabled,
  bulkSelected,
  onToggleSelect,
}: {
  job: Job;
  profile: PublicUser | null;
  selected: boolean;
  onOpen: () => void;
  onApply: (payload: ApplyPayload) => void | Promise<void>;
  disabled?: boolean;
  bulkSelected: boolean;
  onToggleSelect: () => void;
}) {
  const waitlists = useWaitlistsData();
  const onAlert = waitlists.isWaitlisted(job.id);
  const age = formatListingAge(job.last_activated_at);
  const hasMoa = !!job.has_moa && !!profile?.university;

  return (
    <Card
      role="article"
      className={cn(
        "relative isolate flex h-full min-h-[250px] flex-col gap-3 overflow-hidden px-6 py-6 transition-colors duration-200",
        selected || bulkSelected
          ? "ring-1 ring-primary ring-offset-1"
          : "hover:border-primary/30 hover:shadow-sm",
      )}
    >
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

      <div className="flex items-start gap-3">
        <Link
          href={`/search/${job.id}`}
          prefetch={false}
          className="static min-w-0 flex-1 rounded-sm after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-primary"
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey) return;
            e.preventDefault();
            onOpen();
          }}
        >
          <JobHead
            title={job.title}
            employer={job.employer?.name}
            headingAs="h2"
            wrap
          />
        </Link>
        {!!job.id && !job.challenge && !job.hibernating && (
          <div
            className={cn(
              "relative z-10 -mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center",
              disabled ? "cursor-default" : "cursor-pointer",
            )}
          >
            <FormCheckbox
              id={`top-select-${job.id}`}
              checked={bulkSelected}
              disabled={disabled}
              setter={() => {
                if (!disabled) onToggleSelect();
              }}
              aria-label={`Select ${job.title ?? "listing"} for bulk apply`}
            />
          </div>
        )}
      </div>

      <div className="-mt-2 flex min-h-7 flex-wrap items-center gap-x-3 gap-y-2">
        <JobBadges job={job} excludes={["moa"]} />
        {hasMoa ? (
          <EmployerMOA
            university_id={profile?.university}
            hasMoa={job.has_moa}
          />
        ) : (
          <CreditedBadge job={job} />
        )}
      </div>
      <div className="-mt-1">
        <JobLocation location={job.location} />
      </div>
      <div className="min-h-12 text-sm leading-6 text-muted-foreground">
        <div className="line-clamp-2">
          <ReactMarkdown
            allowedElements={["p", "strong", "em", "li"]}
            unwrapDisallowed
            components={{
              p: ({ children }) => <>{children} </>,
              li: ({ children }) => <>{children} </>,
            }}
          >
            {job.description ?? ""}
          </ReactMarkdown>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
        <p className="flex items-center gap-2 text-xs text-gray-500">
          {age && (
            <>
              <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
              Posted {age}
            </>
          )}
        </p>
        <div className="relative z-10 ml-auto flex items-center gap-2">
          <SaveJobButton
            job={job}
            disabled={disabled}
            iconOnly
            animateSave
            className={cn(
              motionStyles.action,
              "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            )}
          />
          <ApplyToJobButton
            profile={profile}
            job={job}
            onApply={onApply}
            disabled={disabled}
            presentation="curated"
            className={cn(
              motionStyles.action,
              "min-h-11 px-5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            )}
          />
        </div>
      </div>
    </Card>
  );
}
