"use client";

import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  MoreHorizontal,
  X,
  Plus,
  Filter,
  Search,
  ChevronDown,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Page section with a top toolbar and a bordered list container */
export function ListShell({
  toolbar,
  children,
  fullWidth = false,
}: {
  toolbar: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  const container = fullWidth ? "w-full" : "max-w-7xl";
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-slate-50">
      <div className="border-b bg-white">
        <div className={`mx-auto w-full px-4 py-3`}>{toolbar}</div>
      </div>
      <div className={`mx-auto ${container} flex-1 overflow-auto px-4 py-4`}>
        <div className="rounded-md border bg-white shadow-sm">
          <ul className="divide-y">{children}</ul>
        </div>
      </div>
    </div>
  );
}

/** Compact text chip for secondary information */
export function Meta({ children }: { children?: React.ReactNode }) {
  const empty =
    children == null ||
    (typeof children === "string" && children.trim() === "") ||
    children == "Not specified";

  if (empty) return null;

  return (
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-slate-600">
      {children}
    </span>
  );
}

export function LastLogin({ ts }: { ts?: number }) {
  if (!ts) return <Meta>last login: Never</Meta>;
  const d = new Date(ts);
  return (
    <Meta>
      last login:
      <time className="ml-1" dateTime={d.toISOString()}>
        {d.toLocaleDateString()}, {d.toLocaleTimeString()}
      </time>
    </Meta>
  );
}

/** Calm row card with hover actions and optional footer (e.g., editable tags) */
export function RowCard(props: {
  title: ReactNode;
  subtitle?: ReactNode;
  metas?: ReactNode;
  footer?: ReactNode;
  leftActions?: ReactNode;
  rightActions?: ReactNode;
  more?: ReactNode;
  onClick?: () => void;
}) {
  const {
    title,
    subtitle,
    metas,
    footer,
    leftActions,
    rightActions,
    more,
    onClick,
  } = props;

  return (
    <li onClick={onClick} className="group px-4 py-3 hover:bg-slate-50">
      <div className="flex items-center gap-3">
        <div className="">{leftActions}</div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="truncate font-medium text-slate-800">{title}</div>
            {subtitle ? (
              <div className="truncate text-sm text-slate-500">{subtitle}</div>
            ) : null}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            {metas}
          </div>
          {footer ? <div className="mt-2">{footer}</div> : null}
        </div>

        <div className="hidden sm:flex items-center gap-1">
          {rightActions}
          {more ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80">
                {more}
              </PopoverContent>
            </Popover>
          ) : null}
        </div>
      </div>
    </li>
  );
}

/* ===========================================================
   Tag utilities (frontend-only, localStorage persistence)
   =========================================================== */

export type TagMap = Record<string, string[]>;

/** Local, namespaced tag map with persistence */
export function useLocalTagMap(storageKey: string) {
  const [tagMap, setTagMap] = useState<TagMap>({});

  // load once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setTagMap(JSON.parse(raw));
    } catch (e) {
      console.warn("[useLocalTagMap] failed to parse storage", e);
    }
  }, [storageKey]);

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(tagMap));
    } catch (e) {
      console.warn("[useLocalTagMap] failed to save storage", e);
    }
  }, [storageKey, tagMap]);

  const sanitize = (t: string) => t.trim().replace(/\s+/g, " ");

  const addTag = useCallback((id: string, raw: string) => {
    const tag = sanitize(raw);
    if (!tag) return;
    setTagMap((prev) => {
      const cur = prev[id] ?? [];
      if (cur.includes(tag)) return prev;
      return { ...prev, [id]: [...cur, tag] };
    });
  }, []);

  const removeTag = useCallback((id: string, tag: string) => {
    setTagMap((prev) => {
      const cur = prev[id] ?? [];
      return { ...prev, [id]: cur.filter((t) => t !== tag) };
    });
  }, []);

  const clearTags = useCallback((id: string) => {
    setTagMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    Object.values(tagMap).forEach((arr) => arr?.forEach((t) => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [tagMap]);

  return { tagMap, setTagMap, addTag, removeTag, clearTags, allTags };
}

/** Small tag pill */
export function TagPill({
  label,
  onRemove,
  onClick,
  active = false,
  className,
}: {
  label: string;
  onRemove?: () => void;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs",
        active ? "bg-slate-800 text-white border-slate-800" : "text-slate-700",
        onClick && "cursor-pointer hover:bg-slate-100",
        className,
      )}
    >
      {label}
      {onRemove ? (
        <button
          onClick={(e) => {
            e.stopPropagation(); // already present for remove safety
            onRemove();
          }}
          className="ml-0.5 -mr-0.5 rounded hover:bg-black/10 p-[2px] transition-all"
          aria-label={`Remove ${label}`}
        >
          <X className="h-3 w-3" />
        </button>
      ) : null}
    </span>
  );
}

/** Inline editor shown under a row: existing tags + input to add new */
export function EditableTags({
  id,
  tags,
  onAdd,
  onRemove,
  suggestions = [],
  placeholder = "add tag…",
}: {
  id: string;
  tags: string[];
  onAdd: (id: string, tag: string) => void;
  onRemove: (id: string, tag: string) => void;
  suggestions?: string[];
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const remaining = suggestions
    .filter(
      (t) => !tags.includes(t) && t.toLowerCase().includes(draft.toLowerCase()),
    )
    .slice(0, 6);

  const commit = () => {
    const t = draft.trim();
    if (t) onAdd(id, t);
    setDraft("");
  };

  return (
    <div
      className="flex flex-col gap-1"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {tags?.map((t) => (
          <TagPill key={t} label={t} onRemove={() => onRemove(id, t)} />
        ))}
        <span className="inline-flex items-center gap-1">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                commit();
              }
            }}
            placeholder={placeholder}
            className="h-6 rounded border px-2 text-xs text-slate-700 outline-none focus:ring-1 focus:ring-slate-300"
          />
          <button
            className="ml-0.5 -mr-0.5 rounded hover:bg-black/10 p-[2px] transition-all"
            onClick={commit}
          >
            <Plus className="h-3 w-3" />
          </button>
        </span>
      </div>

      {draft && remaining.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1">
          {remaining.map((t) => (
            <TagPill
              key={t}
              label={t}
              onClick={() => {
                onAdd(id, t);
                setDraft("");
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Compact summary chip: "Students · 42 (showing 17)" + extras */
export function ListSummary({
  label,
  total,
  visible,
  extras,
}: {
  label: string;
  total: number;
  visible: number;
  extras?: React.ReactNode;
}) {
  const filtered = visible !== total;
  return (
    <span className="inline-flex items-center gap-2 rounded-md border px-3 py-1 text-xs text-slate-700 bg-white">
      <span className="font-medium">{label}</span>
      <span className="tabular-nums">
        {filtered ? (
          <>
            <span className="text-slate-500">·</span> {visible}{" "}
            <span className="text-slate-400">(of {total})</span>
          </>
        ) : (
          <>
            <span className="text-slate-500">·</span> {total}
          </>
        )}
      </span>
      {extras ? (
        <>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1">{extras}</span>
        </>
      ) : null}
    </span>
  );
}

/** Toolbar filter bar with ANY/ALL toggle + popover picker */
export function TagFilterBar({
  allTags,
  active,
  onToggle,
  onClear,
  mode,
  setMode,
}: {
  allTags: string[];
  active: string[];
  onToggle: (tag: string) => void;
  onClear: () => void;
  mode: "any" | "all";
  setMode: (m: "any" | "all") => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");

  const filtered = React.useMemo(
    () => allTags.filter((t) => t.toLowerCase().includes(q.toLowerCase())),
    [allTags, q],
  );

  const visibleActive = active.slice(0, 4);
  const restCount = Math.max(0, active.length - 4);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Label + segmented mode */}
      <div className="inline-flex items-center gap-2 text-xs text-slate-600">
        <Filter className="h-4 w-4" />
        <span>Tags</span>

        {/* Segmented ANY / ALL */}
        <div className="inline-flex rounded-md border bg-white p-0.5">
          <button
            type="button"
            className={cn(
              "h-7 px-2 rounded-[6px] text-xs",
              mode === "any" ? "bg-slate-900 text-white" : "hover:bg-slate-100",
            )}
            onClick={() => setMode("any")}
          >
            ANY
          </button>
          <button
            type="button"
            className={cn(
              "h-7 px-2 rounded-[6px] text-xs",
              mode === "all" ? "bg-slate-900 text-white" : "hover:bg-slate-100",
            )}
            onClick={() => setMode("all")}
          >
            ALL
          </button>
        </div>
      </div>

      {/* Popover selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Filter className="mr-2 h-4 w-4" />
            Select tags
            {active.length > 0 && (
              <span className="ml-2 rounded-full bg-slate-900 px-1.5 text-[10px] font-medium text-white">
                {active.length}
              </span>
            )}
            <ChevronDown className="ml-1 h-4 w-4 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-2">
          {/* Search */}
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Find a tag…"
              className="h-8 w-full rounded border pl-8 pr-2 text-sm outline-none focus:ring-1 focus:ring-slate-300"
            />
          </div>

          {/* List */}
          <div className="max-h-56 overflow-auto pr-1">
            {filtered.length === 0 ? (
              <div className="p-2 text-xs text-slate-400">No tags</div>
            ) : (
              <ul className="space-y-1">
                {filtered.map((t) => {
                  const checked = active.includes(t);
                  return (
                    <li key={t}>
                      <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-slate-50">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300"
                          checked={checked}
                          onChange={() => onToggle(t)}
                        />
                        <span className="truncate">{t}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer actions */}
          <div className="mt-2 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onClear();
                setQ("");
              }}
              disabled={active.length === 0}
            >
              Clear
            </Button>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active chips */}
      <div className="flex flex-wrap items-center gap-1">
        {active.length === 0 ? (
          allTags.length === 0 ? (
            <span className="text-xs text-slate-400">no tags yet</span>
          ) : null
        ) : (
          <>
            {visibleActive.map((t) => (
              <TagPill key={t} label={t} active onRemove={() => onToggle(t)} />
            ))}
            {restCount > 0 && (
              <TagPill
                label={`+${restCount} more`}
                onClick={() => setOpen(true)}
                className="bg-slate-100"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
