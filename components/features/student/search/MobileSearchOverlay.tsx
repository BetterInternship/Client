"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Search } from "lucide-react";
import { Button, cn } from "@betterinternship/components";
import {
  type JobFilter,
  JobFilterPanels,
  JobFilterProvider,
  useJobFilter,
} from "@/components/features/student/search/JobFilters";

interface MobileSearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

/** Parse the current URL params into a query string + JobFilter. */
function parseParams(params: URLSearchParams): {
  query: string;
  filter: JobFilter;
} {
  const split = (key: string) =>
    (params.get(key) || "").split(",").filter(Boolean);
  return {
    query: params.get("query") || "",
    filter: {
      position: split("position"),
      jobMode: split("mode"),
      jobMoa: split("moa"),
      jobWorkload: split("workload"),
      jobAllowance: split("allowance"),
    },
  };
}

/** Build the `/search` URL from a query + filter selection. */
function buildSearchUrl(query: string, filter: JobFilter): string {
  const params = new URLSearchParams();
  if (query.trim()) params.set("query", query.trim());
  if (filter.position.length) params.set("position", filter.position.join(","));
  if (filter.jobMode.length) params.set("mode", filter.jobMode.join(","));
  if (filter.jobWorkload.length)
    params.set("workload", filter.jobWorkload.join(","));
  if (filter.jobAllowance.length)
    params.set("allowance", filter.jobAllowance.join(","));
  if (filter.jobMoa.length) params.set("moa", filter.jobMoa.join(","));
  return `/search/?${params.toString()}`;
}

/**
 * Full-screen mobile search surface: a query field plus the full filter
 * panels, opened from the header's search button. Submitting navigates to
 * `/search` with the assembled params — the search page reads its state
 * from the URL.
 *
 * @component
 */
export function MobileSearchOverlay({
  open,
  onClose,
}: MobileSearchOverlayProps) {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Re-seed the fields from the URL every time the overlay opens.
  const seed = useMemo(
    () => parseParams(new URLSearchParams(searchParams.toString())),
    [open, searchParams],
  );

  // Scroll-lock + Escape while open. (Navigation closes it via the parent,
  // matching the shared header drawer.)
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex flex-col bg-white md:hidden"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          role="dialog"
          aria-modal="true"
          aria-label="Search listings"
        >
          <JobFilterProvider initial={seed.filter}>
            <OverlayBody
              initialQuery={seed.query}
              onClose={onClose}
              onSubmit={buildSearchUrl}
            />
          </JobFilterProvider>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function OverlayBody({
  initialQuery,
  onClose,
  onSubmit,
}: {
  initialQuery: string;
  onClose: () => void;
  onSubmit: (query: string, filter: JobFilter) => string;
}) {
  const router = useRouter();
  const { state, dispatch } = useJobFilter();
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(id);
  }, []);

  const forCredit = state.jobMoa.includes("Has MOA");
  const toggleForCredit = () =>
    dispatch({ type: "TOGGLE", key: "jobMoa", value: "Has MOA" });

  const submit = () => {
    router.push(onSubmit(query, state));
    onClose();
  };

  return (
    <div className="flex h-full flex-col">
      {/* Search bar row */}
      <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
        <button
          type="button"
          aria-label="Close search"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md hover:bg-gray-100"
          onClick={onClose}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="relative flex flex-1 items-center overflow-hidden rounded-[0.33em] border border-gray-300 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20">
          <Search className="pointer-events-none ml-3 h-4 w-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Search listings"
            className="h-10 flex-1 border-0 bg-white px-3 text-sm text-gray-900 outline-none placeholder:text-gray-500 focus:ring-0"
          />
        </div>
      </div>

      {/* Quick toggle */}
      <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
        <button
          type="button"
          onClick={toggleForCredit}
          aria-pressed={forCredit}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            forCredit
              ? "border-primary bg-primary/10 text-primary"
              : "border-gray-300 text-gray-600 hover:bg-gray-50",
          )}
        >
          For Credit only
        </button>
      </div>

      {/* Filters */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <JobFilterPanels />
      </div>

      {/* Footer */}
      <div className="flex gap-2 border-t border-gray-100 p-3">
        <Button
          variant="outline"
          className="w-1/3"
          onClick={() => dispatch({ type: "CLEAR" })}
        >
          Clear
        </Button>
        <Button scheme="primary" className="w-2/3" onClick={submit}>
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>
    </div>
  );
}
