"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AppHeader,
  type NavItem,
} from "@betterinternship/components/app-header";
import { Button, cn } from "@betterinternship/components";
import { BookA, Home, Newspaper, Search } from "lucide-react";

import { HeaderTitle } from "@/components/shared/header";
import { useRoute } from "@/hooks/use-route";
import { useAuthContext } from "@/lib/ctx-auth";
import { useHeaderContext } from "@/lib/ctx-header";
import { useProfileData } from "@/lib/api/student.data.api";
import { hasFormsEnabledUniversity } from "@/lib/student-forms-access";
import { SearchInput } from "@/components/features/student/search/SearchInput";
import { MobileSearchOverlay } from "@/components/features/student/search/MobileSearchOverlay";
import {
  type JobFilter,
  JobFilterProvider,
  JobFilters,
} from "@/components/features/student/search/JobFilters";

/** Routes where the header is suppressed entirely. */
const HIDE_ON_ROUTES = [
  "/register",
  "/register/verify",
  "/miro",
  "/fff",
  "/super-listing",
  "/super-listing/paraluman",
  "/super-listing/anteriore",
];

/**
 * Student portal header, built on the shared package AppHeader.
 * Adds the student-specific global search as an inline
 * field on desktop and a button opening on mobile.
 * Includes the signed-out state and the forms-university gating for the Forms tab.
 *
 * @component
 */
export function StudentAppHeader({
  showActions = true,
  transparent = false,
}: {
  showActions?: boolean;
  transparent?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const { routeExcluded } = useRoute();
  const { desktopHeaderHidden, navigationHidden } = useHeaderContext();
  const { isAuthenticated, logout } = useAuthContext();
  const profile = useProfileData();

  const authenticated = isAuthenticated();
  const showFormsTab = hasFormsEnabledUniversity(profile.data);
  const showFilters = pathname.startsWith("/search");

  const [searchTerm, setSearchTerm] = useState("");
  const [moaOnly, setMoaOnly] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);

  // The last query value we pushed to the URL — lets us ignore our own
  // navigation echoes below while still following deep links / back-forward.
  const lastPushedQuery = useRef<string | null>(null);

  const pushSearch = useCallback(
    (override?: { moa?: boolean; q?: string; replace?: boolean }) => {
      const params = new URLSearchParams();
      const q = override?.q ?? searchTerm;
      const moa = override?.moa ?? moaOnly;

      // Preserve any active filter params.
      if (searchParams.get("position"))
        params.set("position", searchParams.get("position")!);
      if (searchParams.get("mode"))
        params.set("mode", searchParams.get("mode")!);
      if (searchParams.get("workload"))
        params.set("workload", searchParams.get("workload")!);
      if (searchParams.get("allowance"))
        params.set("allowance", searchParams.get("allowance")!);

      if (q) params.set("query", q);
      if (moa) params.set("moa", "Has MOA");

      lastPushedQuery.current = q;
      const url = `/search/?${params.toString()}`;
      if (override?.replace) router.replace(url);
      else router.push(url);
    },
    [router, searchParams, searchTerm, moaOnly],
  );

  const doSearch = () => pushSearch();

  const handleMoaToggle = (value: boolean) => {
    setMoaOnly(value);
    pushSearch({ moa: value });
  };

  // Seed the field from the URL (deep links, back/forward) — but skip our own
  // navigation echoes so it never clobbers what the user is typing.
  useEffect(() => {
    const urlQuery = searchParams.get("query") || "";
    if (urlQuery === lastPushedQuery.current) return;
    lastPushedQuery.current = urlQuery;
    setSearchTerm(urlQuery);
    setMoaOnly(searchParams.get("moa") === "Has MOA");
  }, [searchParams]);

  // Debounced URL sync while typing on the search page.
  useEffect(() => {
    if (!showFilters) return;
    if (searchTerm === (searchParams.get("query") || "")) return;

    const handle = setTimeout(() => {
      pushSearch({ q: searchTerm, moa: moaOnly, replace: true });
    }, 300);
    return () => clearTimeout(handle);
  }, [searchTerm, moaOnly, showFilters, searchParams, pushSearch]);

  // Close the mobile overlay on any navigation.
  useEffect(() => {
    setOverlayOpen(false);
  }, [pathname, searchParams]);

  const initialFromUrl: Partial<JobFilter> = {
    position: (searchParams.get("position") || "").split(",").filter(Boolean),
    jobMode: (searchParams.get("mode") || "").split(",").filter(Boolean),
    jobWorkload: (searchParams.get("workload") || "")
      .split(",")
      .filter(Boolean),
    jobAllowance: (searchParams.get("allowance") || "")
      .split(",")
      .filter(Boolean),
    jobMoa: (searchParams.get("moa") || "").split(",").filter(Boolean),
  };

  const onApplyFilters = (f: JobFilter) => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("query", searchTerm);
    if (f.position.length) params.set("position", f.position.join(","));
    if (f.jobMode.length) params.set("mode", f.jobMode.join(","));
    if (f.jobWorkload.length) params.set("workload", f.jobWorkload.join(","));
    if (f.jobAllowance.length)
      params.set("allowance", f.jobAllowance.join(","));
    if (f.jobMoa.length) params.set("moa", f.jobMoa.join(","));
    router.push(`/search/?${params.toString()}`);
  };

  const isSuperListingRoute =
    pathname === "/super-listing" ||
    pathname === "/student/super-listing" ||
    pathname.startsWith("/super-listing/") ||
    pathname.startsWith("/student/super-listing/");

  if (
    navigationHidden ||
    isSuperListingRoute ||
    !routeExcluded(HIDE_ON_ROUTES)
  ) {
    return null;
  }

  const nav: NavItem[] = [
    { href: "/search", label: "Home", icon: Home },
    ...(showFormsTab
      ? [{ href: "/forms", label: "Forms", icon: Newspaper }]
      : []),
    { href: "/applications", label: "My Jobs", icon: BookA },
  ];

  // The pinned @betterinternship/schema types don't resolve cleanly under
  // the lint TS project, so narrow to just the fields the header reads.
  const profileUser = profile.data as
    | {
        first_name?: string | null;
        last_name?: string | null;
        email?: string | null;
      }
    | null
    | undefined;
  const userPrimary =
    [profileUser?.first_name, profileUser?.last_name]
      .filter(Boolean)
      .join(" ") || undefined;

  const loginRedirect = () =>
    router.push(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`);

  const desktopSearch = showActions ? (
    <div className="flex w-full items-center gap-3 md:max-w-xl">
      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        onEnter={doSearch}
        moaOnly={moaOnly}
        onToggleMoa={handleMoaToggle}
        showForCredit={authenticated}
      />
      {showFilters && (
        <JobFilterProvider initial={initialFromUrl}>
          <JobFilters isDesktop onApply={onApplyFilters} />
        </JobFilterProvider>
      )}
    </div>
  ) : undefined;

  const renderChrome = () => {
    // Maintenance / chrome-less: logo only.
    if (!showActions) {
      return (
        <div
          className={cn(
            "flex items-center px-4 py-3 md:px-8",
            transparent
              ? "bg-transparent"
              : "border-b border-gray-100 bg-white/80 backdrop-blur-md",
          )}
        >
          <HeaderTitle />
        </div>
      );
    }

    // Signed out: no nav to show — a minimal bar with search + "Log in".
    if (!authenticated) {
      return (
        <div className="flex items-center gap-3 border-b border-gray-100 bg-white/80 px-4 py-2 backdrop-blur-md md:px-8">
          <HeaderTitle />
          <div className="hidden min-w-0 flex-1 md:flex md:items-center md:justify-center md:px-4">
            {desktopSearch}
          </div>
          <div className="flex flex-1 items-center justify-end gap-2 md:flex-none">
            <button
              type="button"
              aria-label="Search"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50 md:hidden"
              onClick={() => setOverlayOpen(true)}
            >
              <Search className="h-5 w-5" />
            </button>
            <Button
              type="button"
              variant="outline"
              size="md"
              className="h-10 border-gray-300 hover:bg-gray-50"
              onClick={loginRedirect}
            >
              Log in
            </Button>
          </div>
        </div>
      );
    }

    // Signed in: shared package header.
    return (
      <AppHeader
        brand="BetterInternship"
        logoPath="/BetterInternshipLogo.png"
        homeHref="/search"
        nav={nav}
        userPrimary={userPrimary}
        userSecondary={profileUser?.email ?? undefined}
        logout={logout}
        postLogoutPath="/"
        profileHref="/profile"
        search={desktopSearch}
        onSearchClick={() => setOverlayOpen(true)}
        showMobileMenu={false}
      />
    );
  };

  return (
    <>
      <div
        className={cn(
          "relative z-[100]",
          desktopHeaderHidden &&
            "max-h-0 -translate-y-2 overflow-hidden opacity-0 pointer-events-none transition-all duration-300 ease-out",
        )}
      >
        {renderChrome()}
      </div>

      <MobileSearchOverlay
        open={overlayOpen}
        onClose={() => setOverlayOpen(false)}
      />
    </>
  );
}

export default StudentAppHeader;
