"use client";

import { useEffect, useState } from "react";
import { Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button, cn } from "@betterinternship/components";
import {
  DropdownGroup,
  GroupableRadioDropdown,
} from "@/components/ui/dropdown";
import { useAuthContext } from "@/lib/ctx-auth";
import { useDbRefs } from "@/lib/db/use-refs";
import { useJobListingsPage } from "@/lib/api/student.data.api";
import { savePostLoginRedirect } from "@/lib/post-login-redirect";
import useModalRegistry from "@/components/modals/modal-registry";
import { Job } from "@/lib/db/db.types";

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
  }, [jobs, isPending, error]);

  return null;
}

/**
 * "Show companies with MOA" (plan discussed 2026-09-29). Logged-in students
 * get an in-place filter over this Top page's own listings (has_moa is
 * per-student, so it can't be baked into the anonymous/cached initialJobs
 * snapshot — see fetchTopPage). Logged-out students pick their university
 * first: today only NU-Fairview has an IOM account
 * (ref_universities.iom_university_id), so almost every pick lands on the
 * invite branch — expected, not a bug, given current IOM coverage.
 */
export function ShowMoaButton({
  pageJobs,
  onFilterChange,
}: {
  pageJobs: Job[];
  onFilterChange: (filtered: Job[] | null) => void;
}) {
  const auth = useAuthContext();
  const authenticated = auth.isAuthenticated();
  const { universities, get_university } = useDbRefs();
  const modalRegistry = useModalRegistry();

  const [active, setActive] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleResult = (
    jobIds: Set<string>,
    pending: boolean,
    isError: boolean,
  ) => {
    setIsPending(pending);
    if (isError) {
      toast.error("Couldn't load MOA'd companies right now.");
      setActive(false);
      onFilterChange(null);
      return;
    }
    if (!pending) {
      onFilterChange(pageJobs.filter((job) => job.id && jobIds.has(job.id)));
    }
  };

  const handleToggle = () => {
    if (active) {
      setActive(false);
      onFilterChange(null);
      return;
    }
    setActive(true);
  };

  const handlePickUniversity = (universityId: string | number) => {
    const university = get_university(String(universityId));
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
    return (
      <DropdownGroup>
        <GroupableRadioDropdown
          name="show-moa-university-picker"
          fallback="Show companies with MOA"
          options={universities.map((u) => ({ id: u.id, name: u.name }))}
          onChange={handlePickUniversity}
          className="max-w-xs"
        />
      </DropdownGroup>
    );
  }

  return (
    <>
      {active && <MoaFilterQuery onResult={handleResult} />}
      <Button
        type="button"
        variant="outline"
        scheme="supportive"
        onClick={handleToggle}
        className={cn(
          "gap-2",
          active &&
            "bg-supportive text-supportive-foreground hover:bg-supportive/90",
        )}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Building2 className="h-4 w-4" />
        )}
        {active ? "Showing companies with MOA" : "Show companies with MOA"}
      </Button>
    </>
  );
}
