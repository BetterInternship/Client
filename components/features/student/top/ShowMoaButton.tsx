"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
 * Guests can invite their selected university before signing in. Signed-in
 * students enable the filter; no matching listings opens the invitation.
 * University account status does not determine which flow is shown.
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
  const invitationShown = useRef(false);

  const [isPending, setIsPending] = useState(false);
  const [pickedUniversityId, setPickedUniversityId] = useState<string | null>(
    null,
  );

  const handleResult = useCallback(
    (jobIds: Set<string>, pending: boolean, isError: boolean) => {
      setIsPending(pending);
      if (isError) {
        toast.error("Couldn't load partner companies right now.");
        onActiveChange(false);
        onFilterChange(null);
        return;
      }
      if (!pending) {
        const matchingJobs = filterTopMoaJobs(pageJobs, jobIds);
        onFilterChange(matchingJobs);
        const university = get_university(profile.data?.university);
        if (
          matchingJobs.length === 0 &&
          university &&
          !invitationShown.current
        ) {
          invitationShown.current = true;
          modalRegistry.inviteUniversity.open({
            universityName: university.name,
          });
        }
      }
    },
    [
      pageJobs,
      onFilterChange,
      onActiveChange,
      get_university,
      profile.data?.university,
      modalRegistry,
    ],
  );

  const handleToggle = () => {
    if (active) {
      onActiveChange(false);
      onFilterChange(null);
      return;
    }

    if (!profile.data?.university || isNoUniversity(profile.data.university)) {
      toast.error("Add your university to your profile to use this filter.");
      return;
    }

    invitationShown.current = false;
    setIsPending(true);
    onActiveChange(true);
  };

  const handlePickUniversity = (universityId: string) => {
    const university = get_university(universityId);
    if (!university) return;

    modalRegistry.inviteUniversity.open({
      universityName: university.name,
      onInviteSent: () => {
        modalRegistry.inviteUniversity.close();
        modalRegistry.topUniversityLogin.open({
          universityName: university.name,
          onContinue: () => {
            savePostLoginRedirect(
              `${window.location.pathname}${window.location.search}`,
            );
            window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
          },
        });
      },
    });
    setPickedUniversityId(null);
  };

  if (!authenticated) {
    const universityOptions = sortUniversityOptions(universities)
      .filter((u) => !isNoUniversity(u.id))
      .map((u) => ({
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
        inputIcons="search"
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
