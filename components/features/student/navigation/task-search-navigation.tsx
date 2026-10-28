"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@betterinternship/components";
import { MobileSearchOverlay } from "@/components/features/student/search/MobileSearchOverlay";
import { useAuthContext } from "@/lib/ctx-student-auth";
import { SearchInput } from "@/components/features/student/search/SearchInput";
import {
  JobFilterProvider,
  JobFilters,
  type JobFilter,
} from "@/components/features/student/search/JobFilters";
import { StudentNavigation } from "./student-navigation";

/** URL-owned search behavior extracted from the former app header. */
export default function TaskSearchNavigation(
  props: ComponentProps<typeof StudentNavigation>,
) {
  const router = useRouter();
  const params = useSearchParams();
  const [overlayOpen, setOverlayOpen] = useState(false);
  useEffect(() => setOverlayOpen(false), [params]);
  const { isAuthenticated } = useAuthContext();
  const [term, setTerm] = useState(params.get("query") || "");
  const [moaOnly, setMoaOnly] = useState(params.get("moa") === "Has MOA");
  const lastPushed = useRef<string | null>(null);
  const pushSearch = useCallback(
    (override?: { q?: string; moa?: boolean; replace?: boolean }) => {
      const next = new URLSearchParams(params.toString());
      const q = override?.q ?? term;
      const moa = override?.moa ?? moaOnly;
      if (q) next.set("query", q);
      else next.delete("query");
      if (moa) next.set("moa", "Has MOA");
      else next.delete("moa");
      next.delete("page");
      lastPushed.current = q;
      const url = `/search?${next.toString()}`;
      if (override?.replace) router.replace(url, { scroll: false });
      else router.push(url, { scroll: false });
    },
    [params, term, moaOnly, router],
  );

  useEffect(() => {
    const q = params.get("query") || "";
    setMoaOnly(params.get("moa") === "Has MOA");
    if (q !== lastPushed.current) {
      lastPushed.current = q;
      setTerm(q);
    }
  }, [params]);

  useEffect(() => {
    if (term === (params.get("query") || "")) return;
    const timer = setTimeout(() => pushSearch({ q: term, replace: true }), 300);
    return () => clearTimeout(timer);
  }, [term, params, pushSearch]);

  const initial: Partial<JobFilter> = {
    position: (params.get("position") || "").split(",").filter(Boolean),
    jobMode: (params.get("mode") || "").split(",").filter(Boolean),
    jobWorkload: (params.get("workload") || "").split(",").filter(Boolean),
    jobAllowance: (params.get("allowance") || "").split(",").filter(Boolean),
    jobMoa: (params.get("moa") || "").split(",").filter(Boolean),
  };
  const apply = (filter: JobFilter) => {
    const next = new URLSearchParams();
    if (term) next.set("query", term);
    for (const [key, values] of [
      ["position", filter.position],
      ["mode", filter.jobMode],
      ["workload", filter.jobWorkload],
      ["allowance", filter.jobAllowance],
      ["moa", filter.jobMoa],
    ] as const) {
      if (values.length) next.set(key, values.join(","));
    }
    router.push(`/search?${next.toString()}`, { scroll: false });
  };
  const controls = (
    <div className="flex w-full min-w-0 items-center gap-3">
      <SearchInput
        value={term}
        onChange={setTerm}
        onEnter={() => pushSearch()}
        moaOnly={moaOnly}
        onToggleMoa={(value) => {
          setMoaOnly(value);
          pushSearch({ moa: value });
        }}
        showForCredit={isAuthenticated()}
      />
      <JobFilterProvider initial={initial}>
        <JobFilters onApply={apply} />
      </JobFilterProvider>
    </div>
  );
  return (
    <>
      <StudentNavigation
        {...props}
        search={controls}
        mobileSearch={
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Search"
            onClick={() => setOverlayOpen(true)}
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </Button>
        }
      />
      <MobileSearchOverlay
        open={overlayOpen}
        onClose={() => setOverlayOpen(false)}
      />
    </>
  );
}
