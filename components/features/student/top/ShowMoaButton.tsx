"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button, cn } from "@betterinternship/components";
import { Autocomplete } from "@/components/ui/autocomplete";
import { useAuthContext } from "@/lib/ctx-auth";
import { useDbRefs } from "@/lib/db/use-refs";
import { useJobListingsPage, useProfileData } from "@/lib/api/student.data.api";
import { savePostLoginRedirect } from "@/lib/post-login-redirect";
import {
  isNoUniversity,
  sortUniversityOptions,
  universityAcronyms,
} from "@/lib/student-forms-access";
import useModalRegistry from "@/components/modals/modal-registry";
import { Job } from "@/lib/db/db.types";
import { filterTopMoaJobs } from "@/lib/utils/top-page-presentation";
import motionStyles from "./top-motion.module.css";

// Mounted only while the filter is active, so the authenticated MOA lookup
// (GET /jobs/search?moa=Has MOA, scoped to the caller's own university) never
// fires just from viewing a Top page — only once the student opts in.
function MoaFilterQuery({
  onResult,
}: {
  onResult: (jobIds: Set<string>, isPending: boolean, isError: boolean) => void;
}) {
  const { jobs, isPending, error } = useJobListingsPage({
    moa: ["Has MOA"],
    limit: 200,
  });

  useEffect(() => {
    onResult(
      new Set(jobs.map((j) => j.id).filter((id): id is string => !!id)),
      isPending,
      !!error,
    );
  }, [jobs, isPending, error, onResult]);

  return null;
}

/**
 * "Show companies with MOA" (plan discussed 2026-09-29). Logged-in students
 * get an in-place filter over this Top page's own listings (has_moa is
 * per-student, so it can't be baked into the anonymous/cached initialJobs
 * snapshot — see fetchTopPage) — unless their OWN university has no IOM
 * account yet, in which case a click prompts them to invite it, same as the
 * logged-out branch below. Logged-out students pick their university first,
 * via the same autocomplete the register page uses: today only NU-Fairview
 * has an IOM account (ref_universities.iom_university_id), so almost every
 * pick lands on the invite branch — expected, not a bug, given current IOM
 * coverage.
 */
export function ShowMoaButton({
  pageJobs,
  onFilterChange,
  active,
  onActiveChange,
}: {
  pageJobs: Job[];
  onFilterChange: (filtered: Job[] | null) => void;
  active: boolean;
  onActiveChange: (active: boolean) => void;
}) {
  const auth = useAuthContext();
  const authenticated = auth.isAuthenticated();
  const profile = useProfileData();
  const { universities, get_university } = useDbRefs();
  const modalRegistry = useModalRegistry();

  const [isPending, setIsPending] = useState(false);
  const [pickedUniversityId, setPickedUniversityId] = useState<string | null>(
    null,
  );

  const handleResult = useCallback(
    (jobIds: Set<string>, pending: boolean, isError: boolean) => {
      setIsPending(pending);
      if (isError) {
        toast.error("Couldn't load MOA'd companies right now.");
        onActiveChange(false);
        onFilterChange(null);
        return;
      }
      if (!pending) {
        onFilterChange(filterTopMoaJobs(pageJobs, jobIds));
      }
    },
    [pageJobs, onFilterChange, onActiveChange],
  );

  const handleToggle = () => {
    if (active) {
      onActiveChange(false);
      onFilterChange(null);
      return;
    }

    // Most students' own universities won't have an IOM account either
    // (today, only NU-Fairview does) — send them down the same invite branch
    // logged-out pickers use instead of silently filtering to zero results.
    const studentUniversity = get_university(profile.data?.university);
    if (
      studentUniversity &&
      !isNoUniversity(studentUniversity.id) &&
      !studentUniversity.iom_university_id
    ) {
      modalRegistry.inviteUniversity.open({
        universityName: studentUniversity.name,
      });
      return;
    }

    setIsPending(true);
    onActiveChange(true);
  };

  const handlePickUniversity = (universityId: string) => {
    const university = get_university(universityId);
    if (!university) return;

    // Don't try to reconcile the picked university against the profile the
    // student ends up with — they set their real one at signup same as
    // always (2026-09-29 decision).
    if (university.iom_university_id) {
      savePostLoginRedirect(
        `${window.location.pathname}${window.location.search}`,
      );
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
      return;
    }

    modalRegistry.inviteUniversity.open({ universityName: university.name });
  };

  if (!authenticated) {
    const universityOptions = sortUniversityOptions(universities).map((u) => ({
      id: u.id,
      name: u.name,
      keywords: universityAcronyms(u.name),
    }));

    return (
      <Autocomplete
        label="Show companies partnered with"
        placeholder="Select your university"
        options={universityOptions}
        value={pickedUniversityId}
        setter={(val) => {
          setPickedUniversityId(val ?? null);
          if (val) handlePickUniversity(val);
        }}
        preserveOptionOrder
        inputIcons
        className="max-w-xl sm:flex sm:items-center sm:gap-5 [&>div:first-child]:shrink-0 [&>div:first-child]:mb-2 sm:[&>div:first-child]:mb-0 [&_label]:text-base [&_label]:font-semibold [&_label]:text-slate-950 [&_input]:min-h-11 [&_input]:placeholder:text-muted-foreground sm:[&_ul]:top-full max-sm:w-full max-sm:[&_label]:text-sm max-sm:[&_input]:min-h-12 max-sm:[&_input]:bg-white"
      />
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5 max-sm:gap-2">
      <span className="font-semibold text-slate-950 max-sm:text-sm">
        Show companies partnered with
      </span>
      {active && <MoaFilterQuery onResult={handleResult} />}
      <Button
        type="button"
        variant="outline"
        scheme="supportive"
        onClick={handleToggle}
        aria-pressed={active}
        aria-label={`${active ? "Show all internships instead of companies partnered with" : "Show companies partnered with"} ${get_university(profile.data?.university)?.name ?? "your university"}`}
        aria-busy={active && isPending}
        className={cn(
          motionStyles.action,
          "min-h-11 max-w-full gap-2 rounded-lg text-left whitespace-normal max-sm:min-h-12 max-sm:w-full max-sm:justify-start",
          active &&
            "bg-supportive text-supportive-foreground hover:bg-supportive/90",
        )}
      >
        {isPending && active ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Building2 className="h-4 w-4" />
        )}
        {isPending && active
          ? "Loading partners…"
          : (get_university(profile.data?.university)?.name ??
            "Your university")}
      </Button>
    </div>
  );
}
