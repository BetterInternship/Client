"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Job } from "@/lib/db/db.types";
import { TopPageView } from "@/components/features/student/top/TopPageView";
import { useGodTopPage, useTopPagePreviewJobs } from "@/lib/api/god.api";
import { Loader } from "@/components/ui/loader";
import { GuestAuthContextProvider } from "@/lib/ctx-auth";
import type { PublicTopUniversity } from "@/lib/api/top-page.server";

interface PreviewSnapshot {
  name: string;
  job_ids: string[];
}

/** Stands in for whichever university's link the category is opened from. */
const PLACEHOLDER_UNIVERSITY: PublicTopUniversity = {
  id: "",
  name: "University Name",
  slug: "university-name",
  accent_hex: null,
  has_partner_account: false,
};

/**
 * Opened in a new tab from the god editor's "Preview" button. Deliberately
 * lives outside app/hire/god/ — that folder's layout.tsx renders TabsNav
 * unconditionally over every child route, and this page needs to look like
 * the real public page, not a god-mode screen with a tab bar on it.
 *
 * Renders the actual TopPageView — the same component the public
 * /<university>/top/<slug> page uses — rather than a hand-built lookalike, so
 * there's nothing here to drift out of sync and the click-to-open side
 * panel/mobile sheet works exactly like the real page. A category is shared
 * by many universities, so a placeholder stands in for the university: its
 * name fills the heading line, the colour is the default, and the partner
 * control is the one most universities get.
 *
 * `disabled` turns off Apply/Save/Share, the waitlist-alert toggle, the
 * partner control and the links to the university's other pages: this tab
 * has no student session and no real university. The page is wrapped in a
 * logged-out student auth context because the hire layout only provides the
 * hire one, and the student components read the student one.
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
          Preview only — the buttons are disabled here. &quot;
          {PLACEHOLDER_UNIVERSITY.name}&quot; stands in for the university; each
          university&apos;s own link shows its name and colour.{" "}
          {snapshot
            ? "Showing your unsaved edits."
            : "Showing the last saved version."}
        </div>
      </div>
      <GuestAuthContextProvider>
        <TopPageView
          page={{
            id,
            name: effective.name,
            slug: saved?.page?.slug ?? "",
          }}
          university={PLACEHOLDER_UNIVERSITY}
          initialJobs={jobs}
          disabled
        />
      </GuestAuthContextProvider>
    </div>
  );
}
