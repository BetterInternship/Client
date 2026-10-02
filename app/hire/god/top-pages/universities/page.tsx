"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Badge, Button, Input } from "@betterinternship/components";
import { ListSummary } from "@/components/features/hire/god/ui";
import {
  useGodTopUniversityGrid,
  useSaveTopUniversityGrid,
  GodTopUniversityRow,
  SaveTopUniversityRow,
} from "@/lib/api/god.api";
import useModalRegistry from "@/components/modals/modal-registry";
import { Loader } from "@/components/ui/loader";
import { DEFAULT_TOP_PAGE_ACCENT } from "@/lib/utils/top-page-heading";
import { topUniversityUrlProblem } from "@/lib/utils/top-university-url";

const ACCENT_HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;

/** One row's staged state: its colour as typed, and the pages ticked. */
interface StagedRow {
  accentHex: string;
  pageIds: string[];
}

const toStaged = (row: GodTopUniversityRow): StagedRow => ({
  accentHex: row.accent_hex ?? "",
  pageIds: row.page_ids,
});

const sameIds = (a: string[], b: string[]) =>
  a.length === b.length && a.every((id) => b.includes(id));

/**
 * The university grid (Docs/plans/TOP_PAGES_UNIVERSITY_PLAN.md D15): a row
 * per university, a column per Top page, a tick where a university has that
 * page, and the university's colour. Every edit is staged locally and sent
 * in one Save, like the page editor.
 *
 * There is a tick-all per row and deliberately none per column: putting one
 * page on every university at once is not something to do by a stray click.
 */
export default function TopUniversitiesGridPage() {
  const router = useRouter();
  const modalRegistry = useModalRegistry();
  const { data, isPending, error } = useGodTopUniversityGrid();
  const saveGrid = useSaveTopUniversityGrid();

  const [search, setSearch] = useState("");
  // Only rows that have been touched are in here; everything else reads
  // straight from the server's copy.
  const [staged, setStaged] = useState<Record<string, StagedRow>>({});

  const universities = useMemo(() => data?.universities ?? [], [data]);
  const pages = useMemo(() => data?.pages ?? [], [data]);

  const rowOf = (university: GodTopUniversityRow) =>
    staged[university.id] ?? toStaged(university);

  const dirtyIds = useMemo(
    () =>
      universities
        .filter((university) => {
          const row = staged[university.id];
          if (!row) return false;
          return (
            row.accentHex !== (university.accent_hex ?? "") ||
            !sameIds(row.pageIds, university.page_ids)
          );
        })
        .map((university) => university.id),
    [universities, staged],
  );
  const isDirty = dirtyIds.length > 0;

  // beforeunload guard — in-app navigation isn't intercepted (no stable
  // "will navigate" hook in the App Router), so this covers tab
  // close/refresh/address-bar navigation only, same as the page editor.
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const update = (
    university: GodTopUniversityRow,
    change: Partial<StagedRow>,
  ) => {
    setStaged((prev) => ({
      ...prev,
      [university.id]: {
        ...(prev[university.id] ?? toStaged(university)),
        ...change,
      },
    }));
  };

  const togglePage = (university: GodTopUniversityRow, pageId: string) => {
    const { pageIds } = rowOf(university);
    update(university, {
      pageIds: pageIds.includes(pageId)
        ? pageIds.filter((id) => id !== pageId)
        : [...pageIds, pageId],
    });
  };

  const toggleAll = (university: GodTopUniversityRow) => {
    const allTicked = pages.every((page) =>
      rowOf(university).pageIds.includes(page.id),
    );
    update(university, { pageIds: allTicked ? [] : pages.map((p) => p.id) });
  };

  const handleSave = async () => {
    const changes: SaveTopUniversityRow[] = [];
    for (const university of universities) {
      if (!dirtyIds.includes(university.id)) continue;
      const row = rowOf(university);
      const accent = row.accentHex.trim();
      if (accent && !ACCENT_HEX_PATTERN.test(accent)) {
        toast.error(
          `"${university.name}" has an invalid colour. Use a hex code like ${DEFAULT_TOP_PAGE_ACCENT}.`,
        );
        return;
      }
      changes.push({
        id: university.id,
        accent_hex: accent || null,
        page_ids: row.pageIds,
      });
    }
    if (!changes.length) return;

    const response = await saveGrid.mutateAsync(changes);
    if (!response.success) {
      toast.error(response.message ?? "Could not save. Reload and try again.");
      return;
    }
    setStaged({});
    toast.success("Saved.");
  };

  if (isPending) return <Loader>Loading…</Loader>;
  if (error || !data?.universities) {
    return (
      <div className="p-6 text-sm text-red-600">
        Could not load the university grid.
      </div>
    );
  }

  const needle = search.trim().toLowerCase();
  const visible = needle
    ? universities.filter((u) => u.name.toLowerCase().includes(needle))
    : universities;
  const setUpCount = universities.filter((u) => u.page_ids.length > 0).length;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-slate-50">
      <div className="border-b bg-white">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/god/top-pages")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Top Pages
          </Button>
          <ListSummary
            label="Universities"
            total={universities.length}
            visible={visible.length}
          />
          <span className="text-xs text-slate-500">
            {setUpCount} with pages
          </span>
          <Input
            placeholder="Filter by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <div className="ml-auto flex items-center gap-2">
            {isDirty && (
              <Badge variant="solid" type="destructive">
                {dirtyIds.length} unsaved
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={!isDirty || saveGrid.isPending}
              onClick={() => setStaged({})}
            >
              Discard
            </Button>
            <Button
              size="sm"
              scheme="primary"
              disabled={!isDirty || saveGrid.isPending}
              onClick={() => void handleSave()}
            >
              {saveGrid.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4">
        {pages.length === 0 ? (
          <p className="rounded-md border bg-white p-6 text-sm text-slate-500">
            No Top pages yet. Create one first, then tick it for the
            universities that should have it.
          </p>
        ) : (
          <div className="max-h-[calc(100vh-10rem)] overflow-auto rounded-md border bg-white shadow-sm">
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 top-0 z-20 min-w-72 border-b bg-white px-4 py-2 text-left text-xs font-medium text-slate-600">
                    University
                  </th>
                  <th className="sticky top-0 z-10 border-b bg-white px-3 py-2 text-left text-xs font-medium text-slate-600">
                    Colour
                  </th>
                  {pages.map((page) => (
                    <th
                      key={page.id}
                      className="sticky top-0 z-10 border-b bg-white px-3 py-2 text-center text-xs font-medium text-slate-600"
                    >
                      <div className="whitespace-nowrap">{page.name}</div>
                      {!page.is_published && (
                        <Badge
                          variant="solid"
                          type="default"
                          className="mt-1 text-[10px]"
                        >
                          Draft
                        </Badge>
                      )}
                    </th>
                  ))}
                  <th className="sticky top-0 z-10 border-b bg-white px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {visible.map((university) => {
                  const row = rowOf(university);
                  const dirty = dirtyIds.includes(university.id);
                  const urlProblem = university.slug_clash
                    ? "Another university has the same web address."
                    : topUniversityUrlProblem(university.slug);
                  const allTicked = pages.every((page) =>
                    row.pageIds.includes(page.id),
                  );
                  const swatch = ACCENT_HEX_PATTERN.test(row.accentHex)
                    ? row.accentHex
                    : DEFAULT_TOP_PAGE_ACCENT;

                  return (
                    <tr key={university.id} className="group">
                      <td
                        className={`sticky left-0 z-10 border-b px-4 py-2 ${dirty ? "bg-amber-50" : "bg-white group-hover:bg-slate-50"}`}
                      >
                        <button
                          type="button"
                          className="cursor-pointer text-left font-medium text-slate-800 underline-offset-2 hover:underline"
                          onClick={() =>
                            modalRegistry.topUniversityLinks.open({
                              universityName: university.name,
                              universitySlug: university.slug,
                              pages: pages.filter((page) =>
                                university.page_ids.includes(page.id),
                              ),
                              hasUnsavedChanges: dirty,
                            })
                          }
                        >
                          {university.name}
                        </button>
                        <div className="mt-0.5 text-xs text-slate-500">
                          /{university.slug}
                        </div>
                        {urlProblem && (
                          <div className="mt-0.5 text-xs text-red-600">
                            Can&apos;t have pages. {urlProblem}
                          </div>
                        )}
                      </td>
                      <td
                        className={`border-b px-3 py-2 ${dirty ? "bg-amber-50" : "group-hover:bg-slate-50"}`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            aria-label={`Colour for ${university.name}`}
                            value={swatch}
                            onChange={(e) =>
                              update(university, { accentHex: e.target.value })
                            }
                            className="h-8 w-10 shrink-0 cursor-pointer rounded border border-gray-200"
                          />
                          <Input
                            value={row.accentHex}
                            placeholder="Default"
                            onChange={(e) =>
                              update(university, { accentHex: e.target.value })
                            }
                            className="w-28"
                          />
                        </div>
                      </td>
                      {pages.map((page) => (
                        <td
                          key={page.id}
                          className={`border-b px-3 py-2 text-center ${dirty ? "bg-amber-50" : "group-hover:bg-slate-50"}`}
                        >
                          <input
                            type="checkbox"
                            aria-label={`${page.name} for ${university.name}`}
                            checked={row.pageIds.includes(page.id)}
                            disabled={!!urlProblem}
                            onChange={() => togglePage(university, page.id)}
                            className="h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
                          />
                        </td>
                      ))}
                      <td
                        className={`border-b px-3 py-2 text-right ${dirty ? "bg-amber-50" : "group-hover:bg-slate-50"}`}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={!!urlProblem}
                          onClick={() => toggleAll(university)}
                        >
                          {allTicked ? "Untick all" : "Tick all"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {visible.length === 0 && (
                  <tr>
                    <td
                      colSpan={pages.length + 3}
                      className="px-4 py-6 text-sm text-slate-500"
                    >
                      No university matches that name.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
