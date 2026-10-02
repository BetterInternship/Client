"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Job } from "@/lib/db/db.types";
import { TopPageView } from "@/components/features/student/top/TopPageView";
import { useGodTopPage, useTopPagePreviewJobs } from "@/lib/api/god.api";
import { Loader } from "@/components/ui/loader";

interface PreviewSnapshot {
  name: string;
  job_ids: string[];
}

/**
 * Opened in a new tab from the god editor's "Preview" button. Deliberately
 * lives outside app/hire/god/ — that folder's layout.tsx renders TabsNav
 * unconditionally over every child route, and this page needs to look like
 * the real public page, not a god-mode screen with a tab bar on it.
 *
 * Renders the actual TopPageView — the same component the public
 * /<university>/top/<slug> page uses — rather than a hand-built lookalike. It
 * previews the category on its own, with no university: the default colour,
 * no "for <university> students" line and no partner control, since all
 * three belong to a university and a category is shared by many. There's
 * otherwise nothing here to
 * drift out of sync and the click-to-open side panel/mobile sheet works
 * exactly like the real page. `disabled` turns off Apply/Save/Share/the
 * waitlist-alert toggle: this tab has no student session, so those buttons
 * would otherwise redirect straight into the student Google OAuth flow (or,
 * if this browser happens to also hold a real student session, actually
 * apply/save/alert for real).
 *
 * Reads the editor's staged (possibly unsaved) name/order out of
 * sessionStorage — set by the opener right before window.open, same
 * origin/tab so the browser carries it over — and falls back to the
 * last-saved page if that's missing (a manual reload of this tab).
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
          job_ids: saved.page.members.map((m) => m.job_id),
        }
      : null);

  const jobIds = effective?.job_ids ?? [];
  const jobsQuery = useTopPagePreviewJobs(jobIds);
  const jobs: Job[] = jobsQuery.data?.jobs ?? [];

  if (!checkedStorage || (!snapshot && savedPending)) {
    return <Loader>Loading preview…</Loader>;
  }
  if (!effective) {
    return (
      <div className="p-6 text-sm text-red-600">Could not load a preview.</div>
    );
  }
  if (jobIds.length > 0 && jobsQuery.isPending) {
    return <Loader>Loading listings…</Loader>;
  }

  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-2 text-xs text-slate-500">
          Preview only — Apply, Save and Share are disabled here. The
          university&apos;s name, colour and partner button appear on each
          university&apos;s own link.{" "}
          {snapshot
            ? "Showing your unsaved edits."
            : "Showing the last saved version."}
        </div>
      </div>
      <TopPageView
        page={{
          id,
          name: effective.name,
          slug: saved?.page?.slug ?? "",
        }}
        initialJobs={jobs}
        disabled
      />
    </div>
  );
}
