"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Job } from "@/lib/db/db.types";
import { TopPageView } from "@/components/features/student/top/TopPageView";
import { TopPageService } from "@/lib/api/services";
import { Loader } from "@/components/ui/loader";
import { GuestAuthContextProvider } from "@/lib/ctx-auth";
import type { PublicTopUniversity } from "@/lib/api/top-page.server";

/** Stands in for whichever university's link the category is opened from. */
const PLACEHOLDER_UNIVERSITY: PublicTopUniversity = {
  id: "",
  name: "University Name",
  slug: "university-name",
  accent_hex: null,
  has_partner_account: false,
};

/**
 * Opened in a new tab by the tools site's Top page editor ("Preview"),
 * with the editor's staged — possibly unsaved — name and listing order in the
 * URL: `?name=…&slug=…&job_ids=a,b,c`. It needs no sign-in: the listings come
 * from Career's public preview route, which only returns listings the public
 * pages already show.
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
 */
function TopPagePreview() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const name = searchParams.get("name") ?? "";
  const slug = searchParams.get("slug") ?? "";
  const jobIds = (searchParams.get("job_ids") ?? "")
    .split(",")
    .map((jobId) => jobId.trim())
    .filter(Boolean);

  const jobsQuery = useQuery({
    queryKey: ["top-page-preview-jobs", jobIds],
    queryFn: () => TopPageService.previewJobs(jobIds),
    enabled: jobIds.length > 0,
  });
  const jobs: Job[] = jobsQuery.data?.jobs ?? [];

  if (!name) {
    return (
      <div className="p-6 text-sm text-red-600">
        Could not load a preview. Open it again from the editor.
      </div>
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
          university&apos;s own link shows its name and colour. Showing the
          editor&apos;s current version, saved or not.
        </div>
      </div>
      <GuestAuthContextProvider>
        <TopPageView
          page={{ id: params.id, name, slug }}
          university={PLACEHOLDER_UNIVERSITY}
          initialJobs={jobs}
          disabled
        />
      </GuestAuthContextProvider>
    </div>
  );
}

export default function TopPagePreviewPage() {
  return (
    <Suspense fallback={<Loader>Loading preview…</Loader>}>
      <TopPagePreview />
    </Suspense>
  );
}
