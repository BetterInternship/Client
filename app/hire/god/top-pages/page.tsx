"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge, Button, Input } from "@betterinternship/components";
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
import useModalRegistry from "@/components/modals/modal-registry";

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
      subtitle={`/<university>/top/${page.slug}`}
      metas={
        <>
          <Badge
            variant="solid"
            type={page.is_published ? "supportive" : "default"}
          >
            {page.is_published ? "Published" : "Unpublished"}
          </Badge>
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
  const modalRegistry = useModalRegistry();
  const { data, isPending } = useGodTopPages();
  const createTopPage = useCreateTopPage();

  const [newName, setNewName] = useState("");
  const debouncedName = useDebouncedValue(newName, 250);

  const preview = useQuery({
    queryKey: ["god-top-page-new-preview", debouncedName],
    queryFn: () => fetchTopPageSlugPreview(debouncedName),
    enabled: debouncedName.trim().length > 0,
  });

  const pages = data?.pages ?? [];

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
      fullWidth
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
                ? `→ /<university>/top/${preview.data.slug}`
                : `"${preview.data.slug}" is taken by "${preview.data.owner?.name ?? "another page"}"`}
            </span>
          )}
          {/* A page is only live at the universities it is ticked for —
              that, each university's colour and its links live in the grid. */}
          <div className="ml-auto flex items-center gap-2">
            {/* Rebuilds and warms every live page now. Confirmed in a modal
                first: it is a lot of work to trigger by accident. */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => modalRegistry.rebuildTopPages.open()}
            >
              Rebuild all pages
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push("/god/top-pages/universities")}
            >
              Universities
            </Button>
          </div>
        </div>
      }
    >
      {isPending ? (
        <li className="px-4 py-6 text-sm text-slate-500">Loading…</li>
      ) : pages.length === 0 ? (
        <li className="px-4 py-6 text-sm text-slate-500">No Top pages yet.</li>
      ) : (
        pages.map((page) => (
          <TopPageRow
            key={page.id}
            page={page}
            onClick={() => router.push(`/god/top-pages/${page.id}`)}
          />
        ))
      )}
    </ListShell>
  );
}
