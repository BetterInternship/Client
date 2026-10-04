"use client";

import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Badge, Button } from "@betterinternship/components";
import { baseUrl } from "@/lib/site-url";
import { currentManilaWeek, nextManilaWeek } from "@/lib/utils/manila-week";

interface LinkedPage {
  id: string;
  name: string;
  slug: string;
  is_published: boolean;
}

const copy = (text: string, message: string) => {
  void navigator.clipboard.writeText(text);
  toast.success(message);
};

function LinkRow({ url }: { url: string }) {
  return (
    <div className="flex min-w-0 items-center gap-1 text-xs text-slate-500">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="flex min-w-0 items-center gap-1 underline"
      >
        <span className="truncate">{url}</span>
        <ExternalLink className="h-3 w-3 shrink-0" />
      </a>
      <button
        type="button"
        className="shrink-0 cursor-pointer rounded p-1 hover:bg-slate-100"
        aria-label="Copy link"
        onClick={() => copy(url, "Link copied.")}
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/**
 * The links of one university's Top pages, opened from the god university
 * grid (Docs/plans/TOP_PAGES_UNIVERSITY_PLAN.md D15): its landing page, and
 * for each saved category the plain link plus the two pubmat QR links.
 *
 * QR links carry ?week= so a stale pubmat shows the old-QR banner
 * (TOP_PAGES_WEEK_PARAM_PLAN.md). "Next week" exists because pubmats are
 * made ahead: a QR copied on Friday with this week's value is stale from the
 * Sunday it first goes on display.
 */
export function TopUniversityLinksModal({
  universitySlug,
  pages,
  hasUnsavedChanges,
}: {
  universitySlug: string;
  /** The categories saved (not just staged) for this university. */
  pages: LinkedPage[];
  hasUnsavedChanges: boolean;
}) {
  const landingUrl = `${baseUrl}/${universitySlug}`;
  const livePages = pages.filter((page) => page.is_published);
  const draftPages = pages.filter((page) => !page.is_published);
  const qrWeeks = [
    { label: "this week", week: currentManilaWeek() },
    { label: "next week", week: nextManilaWeek() },
  ];

  return (
    <div className="flex flex-col gap-5 pt-2">
      {hasUnsavedChanges && (
        <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-500">
          This university has unsaved changes. Only saved categories are listed
          here.
        </p>
      )}

      {livePages.length === 0 ? (
        <p className="text-sm text-slate-600">
          No live pages yet. A category is live once it is ticked for this
          university, saved, and the category itself is published.
        </p>
      ) : (
        <>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-800">
              Landing page
            </h3>
            <LinkRow url={landingUrl} />
          </div>

          {livePages.map((page) => {
            const url = `${landingUrl}/top/${page.slug}`;
            return (
              <div key={page.id} className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-800">
                  {page.name}
                </h3>
                <LinkRow url={url} />
                <div className="flex flex-wrap gap-2">
                  {qrWeeks.map(({ label, week }) => (
                    <Button
                      key={week.key}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copy(`${url}?week=${week.key}`, "QR link copied.")
                      }
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy QR link: {label} ({week.label})
                    </Button>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}

      {draftPages.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          Ticked but not live until published:
          {draftPages.map((page) => (
            <Badge key={page.id} variant="solid" type="default">
              {page.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
