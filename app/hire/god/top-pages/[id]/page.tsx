"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Reorder } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Eye,
  GripVertical,
  X,
} from "lucide-react";
import { Badge, Button, Input } from "@betterinternship/components";
import { Meta } from "@/components/features/hire/god/ui";
import {
  useGodTopPage,
  useSaveTopPage,
  useTopPageCandidates,
  fetchTopPageSlugPreview,
  TopPageCandidate,
  TopPageMemberState,
} from "@/lib/api/god.api";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useDbRefs } from "@/lib/db/use-refs";
import {
  topHeading,
  DEFAULT_TOP_PAGE_ACCENT,
} from "@/lib/utils/top-page-heading";
import { pickForeground } from "@/lib/utils/contrast";
import { Loader } from "@/components/ui/loader";
import { baseUrl } from "@/lib/site-url";

const MAX_MEMBERS = 12;

const STATE_LABEL: Record<TopPageMemberState, string> = {
  live: "Live",
  hibernating: "Hibernating",
  off: "Off",
  unlisted: "Unlisted",
  unverified_employer: "Unverified employer",
};

const VISIBLE_STATES: TopPageMemberState[] = ["live", "hibernating"];

interface StagedMember {
  job_id: string;
  title: string;
  employer_name: string | null;
  state: TopPageMemberState;
  last_activated_at?: string;
}

export default function TopPageEditorPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isPending, error } = useGodTopPage(id);
  const saveTopPage = useSaveTopPage(id);

  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState("");
  const [accentHex, setAccentHex] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [members, setMembers] = useState<StagedMember[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  // Stages the server's data locally exactly once per load — every edit
  // after that only touches local state until Save (plan D18).
  useEffect(() => {
    if (!data?.page || loaded) return;
    setName(data.page.name);
    setAccentHex(data.page.accent_hex);
    setIsPublished(data.page.is_published);
    setMembers(
      data.page.members.map((m) => ({
        job_id: m.job_id,
        title: m.title,
        employer_name: m.employer_name,
        state: m.state,
        last_activated_at: m.last_activated_at,
      })),
    );
    setUpdatedAt(data.page.updated_at);
    setLoaded(true);
  }, [data, loaded]);

  const resetToServer = () => {
    if (!data?.page) return;
    setName(data.page.name);
    setAccentHex(data.page.accent_hex);
    setIsPublished(data.page.is_published);
    setMembers(
      data.page.members.map((m) => ({
        job_id: m.job_id,
        title: m.title,
        employer_name: m.employer_name,
        state: m.state,
        last_activated_at: m.last_activated_at,
      })),
    );
    setUpdatedAt(data.page.updated_at);
  };

  const isDirty = useMemo(() => {
    if (!data?.page) return false;
    const original = data.page;
    if (name !== original.name) return true;
    if ((accentHex ?? null) !== (original.accent_hex ?? null)) return true;
    if (isPublished !== original.is_published) return true;
    const originalIds = original.members.map((m) => m.job_id);
    const currentIds = members.map((m) => m.job_id);
    if (originalIds.length !== currentIds.length) return true;
    return originalIds.some((jobId, i) => jobId !== currentIds[i]);
  }, [data, name, accentHex, isPublished, members]);

  // beforeunload guard (plan §6) — in-app navigation isn't intercepted (no
  // stable "will navigate" hook in the App Router), so this covers tab
  // close/refresh/address-bar navigation only.
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const debouncedName = useDebouncedValue(name, 250);
  const slugPreview = useQuery({
    queryKey: ["god-top-page-slug-preview", debouncedName, id],
    queryFn: () => fetchTopPageSlugPreview(debouncedName, id),
    enabled: loaded && debouncedName.trim().length > 0,
  });

  const handleRemove = (jobId: string) => {
    setMembers((prev) => prev.filter((m) => m.job_id !== jobId));
  };

  const handleAdd = (candidate: TopPageCandidate) => {
    if (members.some((m) => m.job_id === candidate.id)) return;
    if (members.length >= MAX_MEMBERS) {
      toast.error(`A page can feature at most ${MAX_MEMBERS} listings.`);
      return;
    }
    setMembers((prev) => [
      ...prev,
      {
        job_id: candidate.id,
        title: candidate.title,
        employer_name: candidate.employer_name,
        state: "live",
        last_activated_at: candidate.last_activated_at,
      },
    ]);
  };

  const handleSave = async () => {
    if (!updatedAt) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Name is required.");
      return;
    }

    const response = await saveTopPage.mutateAsync({
      name: trimmedName,
      accent_hex: accentHex,
      is_published: isPublished,
      job_ids: members.map((m) => m.job_id),
      updated_at: updatedAt,
    });

    if (!response.success) {
      if (response.owner) {
        toast.error(
          `That name maps to the same URL as "${response.owner.name}".`,
        );
      } else if (response.job_ids) {
        toast.error(
          "One or more listings are no longer available and were removed.",
        );
        setMembers((prev) =>
          prev.filter((m) => !response.job_ids?.includes(m.job_id)),
        );
      } else {
        toast.error(
          response.message ?? "Someone else saved this page. Reloading.",
        );
        void queryClient.invalidateQueries({ queryKey: ["god-top-page", id] });
        setLoaded(false);
      }
      return;
    }

    toast.success("Saved.");
    setLoaded(false); // re-stage from the fresh response below on next render
    if (response.page) {
      const page = response.page;
      setName(page.name);
      setAccentHex(page.accent_hex);
      setIsPublished(page.is_published);
      setMembers(
        page.members.map((m) => ({
          job_id: m.job_id,
          title: m.title,
          employer_name: m.employer_name,
          state: m.state,
          last_activated_at: m.last_activated_at,
        })),
      );
      setUpdatedAt(page.updated_at);
      setLoaded(true);
      queryClient.setQueryData(["god-top-page", id], response);
    }
  };

  if (isPending) return <Loader>Loading…</Loader>;
  if (error || !data?.page) {
    return (
      <div className="p-6 text-sm text-red-600">Could not load this page.</div>
    );
  }

  const visibleCount = members.filter((m) =>
    VISIBLE_STATES.includes(m.state),
  ).length;
  const currentPageName = data.page.name;
  const heading = topHeading(visibleCount, name.trim() || currentPageName);
  const accent = accentHex ?? DEFAULT_TOP_PAGE_ACCENT;
  const foreground = pickForeground(accent);
  const publicUrl = `${baseUrl}/top/${data.page.slug}`;

  const handlePreview = () => {
    try {
      sessionStorage.setItem(
        `top-page-preview:${id}`,
        JSON.stringify({
          name: name.trim() || currentPageName,
          accent_hex: accentHex,
          job_ids: members.map((m) => m.job_id),
        }),
      );
    } catch {
      // sessionStorage can throw in a locked-down browser context — the
      // preview tab just falls back to the last saved version instead.
    }
    window.open(`/top-pages-preview/${id}`, "_blank");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/god/top-pages")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Top Pages
        </Button>
        <div className="flex items-center gap-2">
          {isDirty && (
            <Badge variant="solid" type="destructive">
              Pending changes
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={handlePreview}>
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!isDirty || saveTopPage.isPending}
            onClick={resetToServer}
          >
            Discard
          </Button>
          <Button
            size="sm"
            scheme="primary"
            disabled={saveTopPage.isPending}
            onClick={() => void handleSave()}
          >
            {saveTopPage.isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-white p-4 space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Data Science"
            className="max-w-md"
          />
          <p className="mt-1 text-xs text-slate-500">
            {heading}
            {slugPreview.data && (
              <>
                {" — "}
                {slugPreview.data.available ? (
                  <span>
                    /top/<strong>{slugPreview.data.slug}</strong>
                  </span>
                ) : (
                  <span className="text-red-600">
                    "{slugPreview.data.slug}" is taken by "
                    {slugPreview.data.owner?.name ?? "another page"}"
                  </span>
                )}
              </>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Accent colour
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accentHex ?? DEFAULT_TOP_PAGE_ACCENT}
                onChange={(e) => setAccentHex(e.target.value)}
                className="h-8 w-10 cursor-pointer rounded border border-gray-200"
              />
              <Input
                value={accentHex ?? ""}
                placeholder={DEFAULT_TOP_PAGE_ACCENT}
                onChange={(e) => setAccentHex(e.target.value || null)}
                className="w-32"
              />
              {accentHex && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAccentHex(null)}
                >
                  Reset to default
                </Button>
              )}
            </div>
          </div>

          <div
            className="rounded-[0.33em] px-4 py-2 text-sm font-medium"
            style={{ backgroundColor: accent, color: foreground }}
          >
            Apply
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 cursor-pointer"
            />
            Published
          </label>

          {data.page.is_published && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 underline"
              >
                {publicUrl}
                <ExternalLink className="h-3 w-3" />
              </a>
              <button
                type="button"
                className="cursor-pointer rounded p-1 hover:bg-slate-100"
                aria-label="Copy link"
                onClick={() => {
                  void navigator.clipboard.writeText(publicUrl);
                  toast.success("Link copied.");
                }}
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-md border bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            Listings ({members.length} / {MAX_MEMBERS})
          </h3>
        </div>
        {members.length === 0 ? (
          <p className="text-xs text-slate-500">
            No listings yet — add some below.
          </p>
        ) : (
          <Reorder.Group
            axis="y"
            values={members}
            onReorder={setMembers}
            className="space-y-2"
          >
            {members.map((member) => (
              <Reorder.Item
                key={member.job_id}
                value={member}
                className="flex cursor-grab items-center gap-3 rounded-md border bg-white p-3 active:cursor-grabbing"
              >
                <GripVertical className="h-4 w-4 shrink-0 text-slate-400" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-slate-800">
                    {member.title}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="truncate text-xs text-slate-500">
                      {member.employer_name ?? "Unknown"}
                    </span>
                    {member.last_activated_at && (
                      <Meta>
                        active{" "}
                        {new Date(
                          member.last_activated_at,
                        ).toLocaleDateString()}
                      </Meta>
                    )}
                  </div>
                </div>
                {member.state !== "live" && (
                  <Badge
                    variant="solid"
                    type="warning"
                    className="shrink-0 text-xs"
                  >
                    {STATE_LABEL[member.state]}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 shrink-0 p-0"
                  aria-label={`Remove ${member.title}`}
                  onClick={() => handleRemove(member.job_id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>

      <TopPageCandidatePicker
        onAdd={handleAdd}
        atCap={members.length >= MAX_MEMBERS}
        existingIds={members.map((m) => m.job_id)}
      />
    </div>
  );
}

function TopPageCandidatePicker({
  onAdd,
  atCap,
  existingIds,
}: {
  onAdd: (candidate: TopPageCandidate) => void;
  atCap: boolean;
  existingIds: string[];
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);
  const { job_categories } = useDbRefs();

  const { data, isPending } = useTopPageCandidates({
    search: debouncedSearch || undefined,
    category: category || undefined,
    page,
  });
  const candidates = data?.data ?? [];

  return (
    <div className="space-y-3 rounded-md border bg-white p-4">
      <h3 className="text-sm font-semibold">Add a listing</h3>
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search title or company"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs flex-1"
        />
        <select
          className="rounded-[0.33em] border border-gray-200 px-2 text-sm"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All categories</option>
          {job_categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {isPending ? (
        <p className="text-xs text-slate-500">Loading…</p>
      ) : candidates.length === 0 ? (
        <p className="text-xs text-slate-500">No listings match.</p>
      ) : (
        <ul className="max-h-72 divide-y overflow-auto">
          {candidates.map((c) => {
            const already = existingIds.includes(c.id);
            return (
              <li
                key={c.id}
                className="flex items-center justify-between gap-2 py-2"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{c.title}</div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="truncate text-xs text-slate-500">
                      {c.employer_name ?? "Unknown"}
                    </span>
                    <Meta>
                      active{" "}
                      {new Date(c.last_activated_at).toLocaleDateString()}
                    </Meta>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={already || (atCap && !already)}
                  onClick={() => onAdd(c)}
                >
                  {already ? "Added" : "Add"}
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant="ghost"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={candidates.length < 20}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
