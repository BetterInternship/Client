"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button, Input } from "@betterinternship/components";
import {
  ListShell,
  RowCard,
  Meta,
  ListSummary,
} from "@/components/features/hire/god/ui";
import {
  useGodTopPages,
  useCreateTopPage,
  fetchTopPageSlugPreview,
  TopPageListRow,
} from "@/lib/api/god.api";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

function TopPageRow({
  page,
  onClick,
}: {
  page: TopPageListRow;
  onClick: () => void;
}) {
  return (
    <RowCard
      onClick={onClick}
      title={page.name}
      subtitle={`/top/${page.slug}`}
      metas={
        <>
          <Meta>{page.is_published ? "Published" : "Draft"}</Meta>
          <Meta>
            {page.member_count} member{page.member_count === 1 ? "" : "s"}
            {page.hidden_count ? ` (${page.hidden_count} hidden)` : ""}
          </Meta>
          <Meta>saved {new Date(page.updated_at).toLocaleDateString()}</Meta>
        </>
      }
    />
  );
}

/**
 * Top pages list (plan §6). Typing a name creates a new (unpublished) page —
 * the whole point of D1: no separate "create" form, just a name.
 */
export default function TopPagesListPage() {
  const router = useRouter();
  const { data, isPending } = useGodTopPages();
  const createTopPage = useCreateTopPage();

  const [newName, setNewName] = useState("");
  const debouncedName = useDebouncedValue(newName, 250);

  const preview = useQuery({
    queryKey: ["god-top-page-new-preview", debouncedName],
    queryFn: () => fetchTopPageSlugPreview(debouncedName),
    enabled: debouncedName.trim().length > 0,
  });

  const [showUnpublished, setShowUnpublished] = useState(false);

  const pages = data?.pages ?? [];
  const published = pages.filter((p) => p.is_published);
  const unpublished = pages.filter((p) => !p.is_published);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name || createTopPage.isPending) return;

    const response = await createTopPage.mutateAsync(name);
    if (!response.success) {
      toast.error(
        response.owner
          ? `"${name}" maps to the same URL as "${response.owner.name}".`
          : response.message || "Could not create page.",
      );
      return;
    }

    setNewName("");
    if (response.page) router.push(`/god/top-pages/${response.page.id}`);
  };

  return (
    <ListShell
      toolbar={
        <div className="flex flex-wrap items-center gap-3">
          <ListSummary
            label="Top Pages"
            total={pages.length}
            visible={pages.length}
          />
          <div className="flex items-center gap-2">
            <Input
              placeholder="New page name (e.g. Data Science)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleCreate();
              }}
              className="w-72"
            />
            <Button
              size="sm"
              scheme="primary"
              disabled={!newName.trim() || createTopPage.isPending}
              onClick={() => void handleCreate()}
            >
              Create
            </Button>
          </div>
          {debouncedName.trim() && preview.data && (
            <span className="text-xs text-slate-500">
              {preview.data.available
                ? `→ /top/${preview.data.slug}`
                : `"/top/${preview.data.slug}" is taken by "${preview.data.owner?.name ?? "another page"}"`}
            </span>
          )}
        </div>
      }
    >
      {isPending ? (
        <li className="px-4 py-6 text-sm text-slate-500">Loading…</li>
      ) : pages.length === 0 ? (
        <li className="px-4 py-6 text-sm text-slate-500">No Top pages yet.</li>
      ) : (
        <>
          {published.map((page) => (
            <TopPageRow
              key={page.id}
              page={page}
              onClick={() => router.push(`/god/top-pages/${page.id}`)}
            />
          ))}
          {unpublished.length > 0 && (
            <li className="px-4 py-2">
              <button
                type="button"
                className="cursor-pointer text-xs font-medium text-slate-500 hover:text-slate-700"
                onClick={() => setShowUnpublished((v) => !v)}
              >
                {showUnpublished ? "Hide" : "Show"} unpublished (
                {unpublished.length})
              </button>
            </li>
          )}
          {showUnpublished &&
            unpublished.map((page) => (
              <TopPageRow
                key={page.id}
                page={page}
                onClick={() => router.push(`/god/top-pages/${page.id}`)}
              />
            ))}
        </>
      )}
    </ListShell>
  );
}
