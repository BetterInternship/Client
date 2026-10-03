"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button, cn } from "@betterinternship/components";
import { useAuthContext } from "@/lib/ctx-auth";
import { useDbRefs } from "@/lib/db/use-refs";
import { useJobListingsPage, useProfileData } from "@/lib/api/student.data.api";
import { savePostLoginRedirect } from "@/lib/post-login-redirect";
import { isNoUniversity } from "@/lib/student-forms-access";
import useModalRegistry from "@/components/modals/modal-registry";
import { Job } from "@/lib/db/db.types";
import type { PublicTopUniversity } from "@/lib/api/top-page.server";
import { filterTopMoaJobs } from "@/lib/utils/top-page-presentation";
import motionStyles from "./top-motion.module.css";
import { googleLoginUrl } from "@/lib/api/urls";

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
 * The partner (MOA) control on a university's Top page
 * (Docs/plans/TOP_PAGES_UNIVERSITY_PLAN.md D8–D10).
 *
 * Guests: the university comes from the page's link, so there is nothing to
 * pick. If that university has no partner-platform account, the control
 * explains that and offers the invite; otherwise it prompts a login.
 *
 * Signed-in students: unchanged — the filter is scoped to the university on
 * their own profile and labelled with that name, even on another
 * university's page; no matching listings opens the invitation. Account
 * status plays no part in the signed-in flow.
 */
export function ShowMoaButton({
  university,
  pageJobs,
  onFilterChange,
  active,
  onActiveChange,
  disabled,
}: {
  /** The page's university; the god preview passes a placeholder. */
  university?: PublicTopUniversity;
  pageJobs: Job[];
  onFilterChange: (filtered: Job[] | null) => void;
  active: boolean;
  onActiveChange: (active: boolean) => void;
  /** The god preview: the control is shown but does nothing. */
  disabled?: boolean;
}) {
  const auth = useAuthContext();
  const authenticated = auth.isAuthenticated();
  const profile = useProfileData();
  const { get_university } = useDbRefs();
  const modalRegistry = useModalRegistry();
  const invitationShown = useRef(false);

  const [isPending, setIsPending] = useState(false);

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

  if (!authenticated) {
    // Without a university there is nothing to ask about.
    if (!university) return null;

    // The university has no partner-platform account, so there are no MOAs
    // of its own to filter by: say so, and offer the invite. No login prompt
    // afterwards — logging in would not make any partner companies appear.
    if (!university.has_partner_account) {
      return (
        <div className="flex max-w-xl flex-col items-start gap-3">
          <p className="text-sm leading-6 text-[#526078]">
            {university.name} has not yet uploaded their MOAs to
            BetterInternship. Invite them to see which companies have a MOA with
            them.
          </p>
          <Button
            type="button"
            variant="outline"
            scheme="primary"
            disabled={disabled}
            onClick={() =>
              modalRegistry.inviteUniversity.open({
                universityName: university.name,
              })
            }
            // The page sets --primary to the university's colour. The text
            // uses the darkened accent so a pale colour stays readable, and
            // the hover tint follows the accent instead of the stock blue.
            className={cn(
              motionStyles.action,
              "min-h-11 max-w-full gap-2 rounded-lg text-left text-[color:var(--top-accent-text)] whitespace-normal hover:bg-primary/10 max-sm:min-h-12 max-sm:w-full max-sm:justify-start",
            )}
          >
            <Building2 className="h-4 w-4 shrink-0" />
            Invite {university.name}
          </Button>
        </div>
      );
    }

    // The university is on the platform: its partner companies are shown to
    // logged-in students, so this asks the visitor to log in. After login the
    // filter uses the university on their own profile (the login prompt says
    // so), which may differ from this page's.
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5 max-sm:gap-2">
        <span className="font-semibold text-slate-950 max-sm:text-sm">
          Show companies partnered with
        </span>
        <Button
          type="button"
          variant="outline"
          scheme="supportive"
          disabled={disabled}
          onClick={() =>
            modalRegistry.topUniversityLogin.open({
              universityName: university.name,
              onContinue: () => {
                savePostLoginRedirect(
                  `${window.location.pathname}${window.location.search}`,
                );
                window.location.href = googleLoginUrl();
              },
            })
          }
          className={cn(
            motionStyles.action,
            "min-h-11 max-w-full gap-2 rounded-lg text-left whitespace-normal max-sm:min-h-12 max-sm:w-full max-sm:justify-start",
          )}
        >
          <Building2 className="h-4 w-4 shrink-0" />
          {university.name}
        </Button>
      </div>
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
        disabled={disabled}
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
