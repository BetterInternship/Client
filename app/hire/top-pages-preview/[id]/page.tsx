"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@betterinternship/components";
import { HeartCrack } from "lucide-react";
import { Job } from "@/lib/db/db.types";
import { JobHead, JobLocation, JobBadges } from "@/components/shared/jobs";
import { useGodTopPage, useTopPagePreviewJobs } from "@/lib/api/god.api";
import {
  topHeading,
  DEFAULT_TOP_PAGE_ACCENT,
} from "@/lib/utils/top-page-heading";
import { currentManilaWeek } from "@/lib/utils/manila-week";
import { pickForeground } from "@/lib/utils/contrast";
import { formatListingAge } from "@/lib/utils/relative-age";
import { Loader } from "@/components/ui/loader";

interface PreviewSnapshot {
  name: string;
  accent_hex: string | null;
  job_ids: string[];
}

/**
 * Opened in a new tab from the god editor's "Preview" button. Deliberately
 * lives outside app/hire/god/ — that folder's layout.tsx renders TabsNav
 * unconditionally over every child route, and this page needs to look like
 * the real public page, not a god-mode screen with a tab bar on it. Nothing
 * here is actually less protected: the god pages have no client-side auth
 * gate either way, only the API routes this page calls are god-gated.
 *
 * Reads the editor's staged (possibly unsaved) name/accent/order out of
 * sessionStorage — set by the opener right before window.open, same
 * origin/tab so the browser carries it over — and falls back to the
 * last-saved page if that's missing (a manual reload of this tab, or a
 * browser that doesn't clone it). Renders with the same visibility rules as
 * the public page, but Apply is a static pill rather than the real button:
 * this runs on the hire host with no student session, so the real
 * ApplyToJobButton would just bounce a click straight into the student
 * Google OAuth flow.
 */
export default function TopPagePreviewPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [snapshot, setSnapshot] = useState<PreviewSnapshot | null>(null);
  const [checkedStorage, setCheckedStorage] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`top-page-preview:${id}`);
      if (raw) {
        setSnapshot(JSON.parse(raw) as PreviewSnapshot);
        sessionStorage.removeItem(`top-page-preview:${id}`);
      }
    } catch {
      // falls back to the saved page below
    }
    setCheckedStorage(true);
  }, [id]);

  const { data: saved, isPending: savedPending } = useGodTopPage(
    checkedStorage && !snapshot ? id : undefined,
  );

  const effective: PreviewSnapshot | null =
    snapshot ??
    (saved?.page
      ? {
          name: saved.page.name,
          accent_hex: saved.page.accent_hex,
          job_ids: saved.page.members.map((m) => m.job_id),
        }
      : null);

  const jobIds = effective?.job_ids ?? [];
  const jobsQuery = useTopPagePreviewJobs(jobIds);
  const jobs = jobsQuery.data?.jobs ?? [];

  if (!checkedStorage || (!snapshot && savedPending)) {
    return <Loader>Loading preview…</Loader>;
  }
  if (!effective) {
    return (
      <div className="p-6 text-sm text-red-600">Could not load a preview.</div>
    );
  }

  const accent = effective.accent_hex ?? DEFAULT_TOP_PAGE_ACCENT;
  const foreground = pickForeground(accent);
  const heading = topHeading(jobs.length, effective.name);
  const week = currentManilaWeek();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-2 text-xs text-slate-500">
        Preview only — Apply is disabled here.{" "}
        {snapshot
          ? "Showing your unsaved edits."
          : "Showing the last saved version."}
      </div>

      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl">
          {heading}
        </h1>
        <p className="mt-2 text-muted-foreground">{week.label}</p>
      </header>

      {jobsQuery.isPending ? (
        <Loader>Loading listings…</Loader>
      ) : jobs.length === 0 ? (
        <div className="rounded-[0.33em] border border-dashed border-gray-300 p-12 text-center text-muted-foreground">
          No featured internships right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <PreviewCard
              key={job.id}
              job={job}
              accent={accent}
              foreground={foreground}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PreviewCard({
  job,
  accent,
  foreground,
}: {
  job: Job;
  accent: string;
  foreground: string;
}) {
  const age = formatListingAge(job.last_activated_at);

  return (
    <div className="relative flex flex-col gap-3 overflow-hidden rounded-[0.33em] border bg-white px-6 py-6">
      {job.hibernating && (
        <Badge
          variant="solid"
          type="warning"
          className="flex w-fit items-center gap-1"
        >
          <HeartCrack className="w-3 h-3" />
          Just missed
        </Badge>
      )}
      <JobHead
        title={job.title}
        employer={job.employer?.name}
        wrap={!!job.hibernating}
      />
      <JobLocation location={job.location} />
      <JobBadges job={job} excludes={["moa"]} />
      {age && <p className="text-xs text-muted-foreground">{age}</p>}
      <div
        className="mt-auto inline-flex w-fit cursor-not-allowed rounded-[0.33em] px-3 py-1.5 text-xs font-medium"
        style={{ backgroundColor: accent, color: foreground }}
        title="Preview only — apply is disabled here"
      >
        Apply
      </div>
    </div>
  );
}
