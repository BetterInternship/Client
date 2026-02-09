"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Settings,
  LogOut,
  Search,
  CheckSquare,
  Square,
  ChevronDown,
  BookA,
  Heart,
  Newspaper,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { HeaderTitle } from "@/components/shared/header";
import { MyUserPfp } from "@/components/shared/pfp";

import { useMobile } from "@/hooks/use-mobile";
import { useRoute } from "@/hooks/use-route";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useAuthContext } from "@/lib/ctx-auth";
import { useHeaderContext } from "@/lib/ctx-header";
import { FormsNavigation } from "@/components/features/student/forms/FormsNavigation";
import { useProfileData } from "@/lib/api/student.data.api";
import { cn } from "@/lib/utils";
import {
  isProfileBaseComplete,
  isProfileResume,
  isProfileVerified,
} from "@/lib/profile";
import {
  JobFilterProvider,
  JobFilters,
  JobFilter,
} from "@/components/features/student/search/JobFilters";

/* =======================================================================================
   SHARED COMPONENTS
======================================================================================= */

export const SearchInput = ({
  value,
  onChange,
  onEnter,
  placeholder = "Search listings",
  className = "",
  moaOnly,
  onToggleMoa,
  showForCredit = true,
}: {
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  placeholder?: string;
  className?: string;
  moaOnly: boolean;
  onToggleMoa: (v: boolean) => void;
  showForCredit?: boolean;
}) => {
  return (
    <div
      className={cn(
        "relative w-full border border-gray-300 rounded-[0.33em] overflow-hidden",
        "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40",
        "flex items-center",
        className,
      )}
    >
      <Search className="h-4 w-4 text-gray-400 pointer-events-none ml-3" />

      <input
        type="text"
        value={value}
        onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "flex-1 h-10 px-3",
          "bg-white border-0 outline-none focus:ring-0 text-gray-900 text-sm",
          "placeholder:text-gray-500",
        )}
      />

      {showForCredit && (
        <>
          <div className="h-6 w-0.5 bg-gray-300" />
          <button
            type="button"
            onClick={() => onToggleMoa(!moaOnly)}
            className="flex items-center gap-2 px-3 h-10 hover:bg-gray-50 transition-all"
            aria-pressed={moaOnly}
          >
            {moaOnly ? (
              <CheckSquare className="h-5 w-5 text-primary" />
            ) : (
              <Square className="h-5 w-5 text-gray-400" />
            )}
            <label className="text-xs font-medium text-gray-700 cursor-pointer whitespace-nowrap">
              For Credit
            </label>
          </button>
        </>
      )}
    </div>
  );
};

/* =======================================================================================
   DROPDOWN UTILITIES
======================================================================================= */

interface HoverDropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

interface DropdownMenuItemProps {
  onClick?: () => void;
  href?: string;
  children: React.ReactNode;
}

function DropdownMenuItem({ onClick, href, children }: DropdownMenuItemProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors text-sm"
    >
      {children}
    </button>
  );
}

function HoverDropdown({ trigger, children }: HoverDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleClose = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 100);
  };

  const handleOpenCancel = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        asChild
        onMouseEnter={handleOpenCancel}
        onMouseLeave={handleClose}
      >
        {trigger}
      </PopoverTrigger>
      <PopoverContent
        className="w-max p-1 bg-white border border-gray-200 rounded-[0.33em] shadow-lg"
        align="end"
        side="bottom"
        sideOffset={8}
        onMouseEnter={handleOpenCancel}
        onMouseLeave={handleClose}
        style={{ zIndex: 9999 }}
      >
        <div className="flex flex-col gap-0">{children}</div>
      </PopoverContent>
    </Popover>
  );
}

/* =======================================================================================
   PROFILE BUTTON (shared between mobile & desktop)
======================================================================================= */

export const ProfileButton: React.FC = () => {
  const profile = useProfileData();
  const { isAuthenticated, logout } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  const handleLogout = () => logout().then(() => router.push("/"));

  const handleProfileClick = () => {
    if (!isProfileVerified(profile.data)) {
      router.push(`/register/verify`);
    } else if (
      !isProfileResume(profile.data) ||
      !isProfileBaseComplete(profile.data)
    ) {
      router.push(`profile/complete-profile?dest=profile`);
    } else {
      router.push(`/profile`);
    }
  };

  if (!isAuthenticated()) {
    return (
      <Button
        type="button"
        variant="outline"
        size="md"
        className="h-10 border-gray-300 hover:bg-gray-50"
        onClick={() =>
          router.push(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`)
        }
      >
        Sign in
      </Button>
    );
  }

  return (
    <HoverDropdown
      trigger={
        <Button
          variant="ghost"
          className={cn(
            "group w-20 px-2 py-1 flex-col gap-1 h-auto items-center justify-center rounded-md",
            pathname === "/profile"
              ? "text-primary"
              : "opacity-80 hover:opacity-100 hover:bg-gray-100",
          )}
        >
          <div className="overflow-hidden rounded-full flex items-center justify-center h-6 w-6">
            <MyUserPfp size="6" />
          </div>
          <div className="flex items-center gap-0.5">
            <span className="text-xs">Account</span>
            <ChevronDown className="!h-3 !w-3 transition-transform group-hover:rotate-180" />
          </div>
        </Button>
      }
    >
      <DropdownMenuItem onClick={handleProfileClick}>
        <div className="flex items-center">
          <Settings className="w-4 h-4 inline-block mr-2 text-primary" />
          <span className="text-primary">Profile</span>
        </div>
      </DropdownMenuItem>
      <div className="h-px bg-gray-200 my-1 mx-2" />
      <DropdownMenuItem onClick={() => void handleLogout()}>
        <div className="flex items-center">
          <LogOut className="text-red-500 w-4 h-4 inline-block mr-2" />
          <span className="text-red-500">Sign Out</span>
        </div>
      </DropdownMenuItem>
    </HoverDropdown>
  );
};

/* =======================================================================================
   MOBILE HEADER
======================================================================================= */

interface MobileHeaderProps {
  searchTerm: string;
  moaOnly: boolean;
  onSearchChange: (value: string) => void;
  onMoaToggle: (value: boolean) => void;
  onSearch: () => void;
  onApplyFilters: (filters: JobFilter) => void;
  initialFilterValues: Partial<JobFilter>;
  showFilters: boolean;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  searchTerm,
  moaOnly,
  onSearchChange,
  onMoaToggle,
  onSearch,
  onApplyFilters,
  initialFilterValues,
  showFilters,
}) => {
  const { mobileAddonConfig } = useHeaderContext();

  return (
    <JobFilterProvider initial={initialFilterValues}>
      <div className="flex gap-2 items-center px-4 py-3 bg-white/80 border-b h-16">
        {/* Logo */}
        <div className="flex-shrink-0">
          <HeaderTitle />
        </div>

        {/* Mobile addon - conditionally render FormsNavigation based on config */}
        {mobileAddonConfig?.show && mobileAddonConfig.activeView && (
          <div className="ml-2">
            <FormsNavigation
              activeView={mobileAddonConfig.activeView}
              onViewChange={mobileAddonConfig.onViewChange || (() => {})}
              currentFormName={mobileAddonConfig.currentFormName}
              currentFormLabel={mobileAddonConfig.currentFormLabel}
              variant="inline"
            />
          </div>
        )}

        {/* Search + Filter - only on search page */}
        {showFilters ? (
          <>
            <SearchInput
              value={searchTerm}
              onChange={onSearchChange}
              onEnter={onSearch}
              moaOnly={moaOnly}
              onToggleMoa={onMoaToggle}
              className="flex-1"
              showForCredit={false}
            />
            <div className="flex-shrink-0">
              <JobFilters onApply={onApplyFilters} isDesktop={false} />
            </div>
          </>
        ) : null}
      </div>
    </JobFilterProvider>
  );
};

/* =======================================================================================
   DESKTOP HEADER
======================================================================================= */

interface DesktopHeaderProps {
  searchTerm: string;
  moaOnly: boolean;
  onSearchChange: (value: string) => void;
  onMoaToggle: (value: boolean) => void;
  onSearch: () => void;
  onApplyFilters: (filters: JobFilter) => void;
  initialFilterValues: Partial<JobFilter>;
  showFilters: boolean;
}

const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  searchTerm,
  moaOnly,
  onSearchChange,
  onMoaToggle,
  onSearch,
  onApplyFilters,
  initialFilterValues,
  showFilters,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      className="flex gap-2 justify-between items-center bg-white/80 backdrop-blur-md border-b border-gray-100 z-[90] py-4 px-8"
      style={{ overflow: "visible", position: "relative", zIndex: 100 }}
    >
      <div className="flex items-center gap-6 flex-1">
        <div className="flex-shrink-0">
          <HeaderTitle />
        </div>

        {/* Search + Filters - only on search page */}
        {showFilters && (
          <div className="flex items-center gap-4 w-full max-w-xl">
            <SearchInput
              value={searchTerm}
              onChange={onSearchChange}
              onEnter={onSearch}
              moaOnly={moaOnly}
              onToggleMoa={onMoaToggle}
            />

            <JobFilterProvider initial={initialFilterValues}>
              <JobFilters isDesktop onApply={onApplyFilters} />
            </JobFilterProvider>
          </div>
        )}
      </div>

      {/* Right side: Navigation buttons + Profile */}
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          {/* Search Button */}
          <Button
            variant="ghost"
            className={cn(
              "w-20 px-2 py-1 flex-col gap-1 h-auto items-center justify-center rounded-md",
              pathname === "/search"
                ? "text-primary"
                : "opacity-80 hover:opacity-100 hover:bg-gray-100",
            )}
            onClick={() => router.push("/search")}
          >
            <Search className="!h-6 !w-6" strokeWidth={1.7} />
            <span className="text-xs">Search</span>
          </Button>

          {/* Forms Button */}
          <Button
            variant="ghost"
            className={cn(
              "w-20 px-2 py-1 flex-col gap-1 h-auto items-center justify-center rounded-md",
              pathname === "/forms"
                ? "text-primary"
                : "opacity-80 hover:opacity-100 hover:bg-gray-100",
            )}
            onClick={() => router.push("/forms")}
          >
            <Newspaper className="!h-6 !w-6" strokeWidth={1.7} />
            <span className="text-xs">Forms</span>
          </Button>

          {/* My Jobs Dropdown */}
          <HoverDropdown
            trigger={
              <Button
                variant="ghost"
                className={cn(
                  "group w-20 px-2 py-1 flex-col gap-1 h-auto items-center justify-center rounded-md",
                  pathname?.startsWith("/applications") ||
                    pathname?.startsWith("/saved")
                    ? "text-primary"
                    : "opacity-80 hover:opacity-100 hover:bg-gray-100",
                )}
              >
                <BookA className="!h-6 !w-6" strokeWidth={1.7} />
                <div className="flex items-center gap-0.5">
                  <span className="text-xs">My Jobs</span>
                  <ChevronDown className="!h-3 !w-3 transition-transform group-hover:rotate-180" />
                </div>
              </Button>
            }
          >
            <DropdownMenuItem href="/applications">
              <div className="flex items-center">
                <CheckSquare className="w-4 h-4 inline-block mr-2 text-primary" />
                <span className="text-primary">Applications</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem href="/saved">
              <div className="flex items-center">
                <Heart className="w-4 h-4 inline-block mr-2 text-primary" />
                <span className="text-primary">Saved Jobs</span>
              </div>
            </DropdownMenuItem>
          </HoverDropdown>
        </div>

        {/* Profile Button */}
        <ProfileButton />
      </div>
    </div>
  );
};

/* =======================================================================================
   MAIN HEADER (Orchestrator)
======================================================================================= */

export const Header: React.FC = () => {
  const { isMobile } = useMobile();
  const { routeExcluded } = useRoute();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [moaOnly, setMoaOnly] = useState(false);

  const noProfileRoutes = ["/register", "/register/verify"];
  const noHeaderRoutes = ["/register", "/register/verify"];
  const showProfileButton = routeExcluded(noProfileRoutes);
  const showFilters = pathname?.startsWith("/search") === true;

  // Sync search params on mount and when route changes
  useEffect(() => {
    if (!showFilters) return;
    setSearchTerm(searchParams.get("query") || "");
    setMoaOnly(searchParams.get("moa") === "Has MOA");
  }, [searchParams, showFilters]);

  // Parse initial filter values from URL
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

  /**
   * Push search query to /search with optional overrides
   */
  const pushSearch = (override?: { moa?: boolean; q?: string }) => {
    const params = new URLSearchParams();
    const q = override?.q ?? searchTerm;
    const moa = override?.moa ?? moaOnly;

    // Preserve existing filters
    if (searchParams.get("position"))
      params.set("position", searchParams.get("position")!);
    if (searchParams.get("mode")) params.set("mode", searchParams.get("mode")!);
    if (searchParams.get("workload"))
      params.set("workload", searchParams.get("workload")!);
    if (searchParams.get("allowance"))
      params.set("allowance", searchParams.get("allowance")!);

    if (q) params.set("query", q);
    if (moa) params.set("moa", "Has MOA");
    router.push(`/search/?${params.toString()}`);
  };

  /**
   * Perform search
   */
  const doSearch = () => pushSearch();

  /**
   * Apply selected filters
   */
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

  // Hide header on register/verify pages
  if (!routeExcluded(noHeaderRoutes)) {
    return <></>;
  }

  return (
    <>
      {/* Mobile Header */}
      {isMobile && showProfileButton && (
        <MobileHeader
          searchTerm={searchTerm}
          moaOnly={moaOnly}
          onSearchChange={setSearchTerm}
          onMoaToggle={(v) => {
            setMoaOnly(v);
            pushSearch({ moa: v });
          }}
          onSearch={doSearch}
          onApplyFilters={onApplyFilters}
          initialFilterValues={initialFromUrl}
          showFilters={showFilters}
        />
      )}

      {/* Desktop Header */}
      {!isMobile && showProfileButton && (
        <DesktopHeader
          searchTerm={searchTerm}
          moaOnly={moaOnly}
          onSearchChange={setSearchTerm}
          onMoaToggle={(v) => {
            setMoaOnly(v);
            pushSearch({ moa: v });
          }}
          onSearch={doSearch}
          onApplyFilters={onApplyFilters}
          initialFilterValues={initialFromUrl}
          showFilters={showFilters}
        />
      )}
    </>
  );
};

export default Header;
