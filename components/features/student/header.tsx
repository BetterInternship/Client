"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Settings,
  BookA,
  Heart,
  LogOut,
  Search,
  ChevronRight,
  X as XIcon,
  CheckSquare,
  Square,
  Newspaper,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import { useProfileData } from "@/lib/api/student.data.api";
import { cn } from "@/lib/utils";
import { getFullName } from "@/lib/profile";
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
   Small UI Primitives
======================================================================================= */
const SearchInput = ({
  value,
  onChange,
  onEnter,
  placeholder = "Search listings",
  className = "",
  moaOnly,
  onToggleMoa,
}: {
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  placeholder?: string;
  className?: string;
  moaOnly: boolean;
  onToggleMoa: (v: boolean) => void;
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
      {/* Left icon */}
      <Search className="h-4 w-4 text-gray-400 pointer-events-none ml-3" />

      {/* Text input */}
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

      {/* Divider */}
      <div className="h-6 w-0.5 bg-gray-300" />

      {/* For Credit Checkbox */}
      <button
        type="button"
        onClick={() => onToggleMoa(!moaOnly)}
        className="flex items-center gap-2 px-3 h-10 hover:bg-gray-50  transition-all"
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
    </div>
  );
};

/* =======================================================================================
   Mobile Drawer (account on top → chats → links → bottom sign out)
======================================================================================= */
function _MobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const profile = useProfileData();
  const { isAuthenticated, logout } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleLogout = () => {
    void logout();
    router.push("/");
  };

  const handleIncompleteProfileClick = (link: string) => {
    if (!isProfileVerified(profile.data)) {
      router.push(`/register/verify`);
    } else if (
      !isProfileResume(profile.data) ||
      !isProfileBaseComplete(profile.data)
    ) {
      router.push(`profile/complete-profile`);
    } else {
      router.push(`/${link}`);
    }
  };
  useEffect(() => {
    if (open) onClose();
  }, [pathname, searchParams?.toString(), onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[120] bg-black/30 backdrop-blur-[2px] transition-opacity duration-200",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed right-0 top-0 z-[121] h-[100svh] w-full max-w-[92%] sm:max-w-[420px] bg-white shadow-xl border-l border-gray-200",
          "transition-transform duration-250 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile menu"
      >
        {/* Shell uses column layout so footer can pin to bottom */}
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+8px)] pb-3 border-b">
            <div className="font-semibold">Menu</div>
            <button
              type="button"
              aria-label="Close menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-100"
              onClick={onClose}
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          {isAuthenticated() && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center gap-3">
                <div className="overflow-hidden rounded-full flex items-center justify-center">
                  <MyUserPfp size="9" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="font-medium">
                    {getFullName(profile.data)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {profile.data?.email}
                  </span>
                </div>
              </div>
              <Separator className="my-4" />
              {/* Navigation */}
              <nav>
                <ul className="grid gap-1">
                  {/* ! Disabled chat for now */}
                  {/* {isAuthenticated() && (
                    <li>
                      <Link href="/conversations" className="block w-full">
                        <button className="w-full flex items-center justify-between rounded-md py-2">
                          <span className="inline-flex items-center text-sm">
                            <MessageCircleMore className="w-4 h-4" /> Chats
                          </span>
                          {conversations?.unreads?.length ? (
                            <span className="text-[10px] leading-none bg-warning/80 px-2 py-1 rounded-full">
                              {conversations.unreads.length}
                            </span>
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                          )}
                        </button>
                      </Link>
                    </li>
                  )} */}
                  <li>
                    <Link href="/search" className="block w-full">
                      <button className="w-full flex items-center justify-between rounded-md px-3 py-2 hover:bg-gray-50 border border-transparent hover:border-gray-200 text-sm">
                        <div>
                          <Search className="w-4 h-4 inline-block mr-2" />
                          <span>Browse</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </button>
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => handleIncompleteProfileClick("profile")}
                      className="w-full flex items-center justify-between rounded-md px-3 py-2 hover:bg-gray-50 border border-transparent hover:border-gray-200 text-sm text-primary"
                    >
                      <div>
                        <Settings className="w-4 h-4 inline-block mr-2" />
                        <span>Profile</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </button>
                  </li>
                  <li>
                    <Link href="/applications" className="block w-full">
                      <button className="w-full flex items-center justify-between rounded-md px-3 py-2 hover:bg-gray-50 border border-transparent hover:border-gray-200 text-sm">
                        <div>
                          <BookA className="w-4 h-4 inline-block mr-2" />
                          <span>Applications</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </button>
                    </Link>
                  </li>
                  <li>
                    <Link href="/saved" className="block w-full">
                      <button className="w-full flex items-center justify-between rounded-md px-3 py-2 hover:bg-gray-50 border border-transparent hover:border-gray-200 text-sm">
                        <div>
                          <Heart className="w-4 h-4 inline-block mr-2" />
                          <span>Saved Jobs</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </button>
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => handleIncompleteProfileClick("forms")}
                      className="w-full flex items-center justify-between rounded-md px-3 py-2 hover:bg-gray-50 border border-transparent hover:border-gray-200 text-sm text-primary"
                    >
                      <div>
                        <Newspaper className="w-4 h-4 inline-block mr-2" />
                        <span>Forms</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}

          {/* Footer pinned to bottom */}
          {isAuthenticated() && (
            <div className="mt-auto border-t px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3">
              <button
                onClick={() => void handleLogout()}
                className="w-full flex items-center justify-center gap-2 text-red-600 font-medium py-2 rounded-md hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

/* =======================================================================================
   Profile Button (desktop)
======================================================================================= */
/* =======================================================================================
   Hover Dropdown (using Popover with proper z-index)
======================================================================================= */
interface HoverDropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
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
   Profile Button (icon over text with hover dropdown)
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
      router.push(`profile/complete-profile`);
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
   Header (top bar + search + filters + mobile drawer)
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

  // only show filters on /search (allow subpaths like /search/results)
  const showFilters = pathname?.startsWith("/search") === true;

  useEffect(() => {
    if (!showFilters) return;
    setSearchTerm(searchParams.get("query") || "");
    setMoaOnly(searchParams.get("moa") === "Has MOA");
  }, [searchParams, showFilters]);

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

  const doSearch = () => pushSearch();

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

  return routeExcluded(noHeaderRoutes) ? (
    <div className="flex flex-col">
      {/* Top Bar */}
      <div
        className={cn(
          "flex gap-2 justify-between items-center bg-white/80 backdrop-blur-md border-b border-gray-100 z-[90]",
          isMobile ? "px-4 py-3 hidden" : "py-4 px-8 flex",
        )}
        style={{ overflow: "visible", position: "relative", zIndex: 100 }}
      >
        <div className="flex items-center gap-6 flex-1">
          {!isMobile && (
            <div className="flex-shrink-0">
              <HeaderTitle />
            </div>
          )}

          {!isMobile && showProfileButton && showFilters && (
            <div className="flex items-center gap-4 w-full max-w-xl">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                onEnter={doSearch}
                moaOnly={moaOnly}
                onToggleMoa={(v) => {
                  setMoaOnly(v);
                  pushSearch({ moa: v });
                }}
              />

              <JobFilterProvider initial={initialFromUrl}>
                <JobFilters isDesktop onApply={onApplyFilters} />
              </JobFilterProvider>
            </div>
          )}
        </div>

        {/* Right: Mobile (nothing) - Desktop profile/nav buttons */}
        {showProfileButton ? (
          !isMobile ? (
            <div className="flex items-center gap-1">
              <div className="flex gap-1">
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
              <ProfileButton />
            </div>
          ) : (
            <></>
          )
        ) : (
          <div className="w-1 h-10 bg-transparent" />
        )}
      </div>

      {/* Mobile: logo + search + filter icon only */}
      {isMobile && showProfileButton && (
        <JobFilterProvider initial={initialFromUrl}>
          <div className="flex gap-2 items-center px-4 py-3 bg-white/80 border-b h-16">
            {/* Search input - only shown on search page */}
            {showFilters && (
              <>
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  onEnter={doSearch}
                  moaOnly={moaOnly}
                  onToggleMoa={(v) => {
                    setMoaOnly(v);
                    pushSearch({ moa: v });
                  }}
                  className="flex-1"
                />
                {/* Mobile filter button - icon only */}
                <div className="flex-shrink-0">
                  <JobFilters onApply={onApplyFilters} isDesktop={false} />
                </div>
              </>
            )}
          </div>
        </JobFilterProvider>
      )}

      {/* Mobile drawer - removed, using bottom nav instead */}
    </div>
  ) : (
    <></>
  );
};

export default Header;
