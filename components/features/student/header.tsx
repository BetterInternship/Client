"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Settings,
  BookA,
  Heart,
  LogOut,
  MessageCircleMore,
  Search,
  ChevronRight,
  X as XIcon,
  Menu,
  Check as CheckIcon,
  Newspaper,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { GroupableNavDropdown, DropdownOption } from "@/components/ui/dropdown";
import { Separator } from "@/components/ui/separator";
import { HeaderTitle } from "@/components/shared/header";
import { MyUserPfp } from "@/components/shared/pfp";

import { useMobile } from "@/hooks/use-mobile";
import { useRoute } from "@/hooks/use-route";
import { useConversations } from "@/hooks/use-conversation";
import { useAuthContext } from "@/lib/ctx-auth";
import { useProfileData } from "@/lib/api/student.data.api";
import { cn } from "@/lib/utils";
import { getFullName } from "@/lib/profile";
import { useQueryClient } from "@tanstack/react-query";
import { useGlobalModal } from "@/components/providers/ModalProvider";
import { IncompleteProfileContent } from "@/components/modals/IncompleteProfileModal";
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
   Compact Search input with inline MOA toggle
======================================================================================= */
const SearchInput = ({
  value,
  onChange,
  onEnter,
  placeholder = "Search Internship Listings",
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
        className
      )}
    >
      {/* Left icon */}
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400 pointer-events-none" />

      {/* Text input */}
      <input
        type="text"
        value={value}
        onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full h-10 pl-10 pr-24",
          "bg-transparent border-0 outline-none focus:ring-0 text-gray-900 text-sm",
          "placeholder:text-gray-500"
        )}
      />

      {/* Right inline MOA toggle (compact pill) */}
      <button
        type="button"
        onClick={() => onToggleMoa(!moaOnly)}
        className={cn(
          "absolute right-1 top-1/2 -translate-y-1/2",
          "inline-flex items-center gap-1.5 h-7 px-2 rounded-md border text-xs",
          "transition-colors",
          moaOnly
            ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
        )}
        aria-pressed={moaOnly}
        aria-label="Filter: DLSU MOA"
      >
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full border h-3.5 w-3.5",
            moaOnly
              ? "border-emerald-400 bg-emerald-100"
              : "border-gray-300 bg-white"
          )}
        >
          <CheckIcon
            className={cn(
              "h-3 w-3",
              moaOnly ? "text-emerald-600" : "text-transparent"
            )}
          />
        </span>
        <span className="leading-none">DLSU&nbsp;MOA</span>
      </button>
    </div>
  );
};

/* =======================================================================================
   Mobile Drawer
======================================================================================= */
function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const profile = useProfileData();
  const { isAuthenticated, logout } = useAuthContext();
  const conversations = useConversations();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { open: openGlobalModal, close: closeGlobalModal } = useGlobalModal();
  const queryClient = useQueryClient();

  const handleLogout = () => logout().then(() => router.push("/"));

  const handleProfileClick = () => {
    if (
      !isProfileResume(profile.data) ||
      !isProfileBaseComplete(profile.data) ||
      !isProfileVerified(profile.data)
    ) {
      openGlobalModal(
        "incomplete-profile",
        <IncompleteProfileContent
          onFinish={() => closeGlobalModal("incomplete-profile")}
        />,
        {
          allowBackdropClick: false,
          onClose: () =>
            queryClient.invalidateQueries({ queryKey: ["my-profile"] }),
        }
      );
    } else {
      router.push("/profile");
    }
  };

  useEffect(() => {
    if (open) onClose();
  }, [pathname, params?.toString()]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[120] bg-black/30 backdrop-blur-[2px] transition-opacity duration-200",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      {/* Drawer */}
      <aside
        className={cn(
          "fixed right-0 top-0 z-[121] h-[100svh] w-full max-w-[92%] sm:max-w-[420px] bg-white shadow-xl border-l border-gray-200",
          "transition-transform duration-250 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+8px)] pb-3 border-b">
            <div className="font-semibold">Menu</div>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-100"
              onClick={onClose}
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          {isAuthenticated() && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center gap-3">
                <div className="overflow-hidden rounded-full">
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
              <nav>
                <ul className="grid gap-1">
                  <li>
                    <Link href="/search" className="block w-full">
                      <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-md text-sm">
                        <Search className="w-4 h-4 mr-2" /> Browse
                        <ChevronRight className="w-4 h-4 ml-auto text-gray-300" />
                      </button>
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleProfileClick}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-md text-sm text-primary"
                    >
                      <Settings className="w-4 h-4 mr-2" /> Profile
                      <ChevronRight className="w-4 h-4 ml-auto text-gray-300" />
                    </button>
                  </li>
                  <li>
                    <Link href="/applications" className="block w-full">
                      <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-md text-sm">
                        <BookA className="w-4 h-4 mr-2" /> Applications
                        <ChevronRight className="w-4 h-4 ml-auto text-gray-300" />
                      </button>
                    </Link>
                  </li>
                  <li>
                    <Link href="/saved" className="block w-full">
                      <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-md text-sm">
                        <Heart className="w-4 h-4 mr-2" /> Saved
                        <ChevronRight className="w-4 h-4 ml-auto text-gray-300" />
                      </button>
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          )}

          {isAuthenticated() && (
            <div className="mt-auto border-t px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3">
              <button
                onClick={handleLogout}
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
   ProfileButton
======================================================================================= */
export const ProfileButton = () => {
  const profile = useProfileData();
  const conversations = useConversations();
  const { isAuthenticated, logout } = useAuthContext();
  const router = useRouter();

  const handleLogout = () => logout().then(() => router.push("/"));

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
    <div className="relative flex items-center gap-2">
      <Link href="/conversations">
        <Button variant="ghost" className="relative">
          <MessageCircleMore className="w-7 h-7" />
          {conversations?.unreads?.length ? (
            <div className="absolute w-3 h-3 top-[-0.33em] right-[-0.4em] rounded-full bg-warning opacity-70" />
          ) : null}
        </Button>
      </Link>
      <GroupableNavDropdown
        display={
          <>
            <div className="overflow-hidden rounded-full flex items-center justify-center">
              <MyUserPfp size="7" />
            </div>
            {getFullName(profile.data, false)}
          </>
        }
        content={
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-xs text-gray-500 text-ellipsis overflow-hidden">
              {profile.data?.email}
            </p>
          </div>
        }
        className="z-[200] w-fit"
      >
        <DropdownOption href="/profile">
          <Settings className="w-4 h-4 inline-block mr-2 text-primary" />
          <span className="text-primary">Profile</span>
        </DropdownOption>
        <DropdownOption href="/applications">
          <BookA className="w-4 h-4 inline-block mr-2 text-primary" />
          <span className="text-primary">Applications</span>
        </DropdownOption>
        <DropdownOption href="/saved">
          <Heart className="w-4 h-4 inline-block mr-2 text-primary" />
          <span className="text-primary">Saved Jobs</span>
        </DropdownOption>
        <DropdownOption href="/forms">
          <Newspaper className="w-4 h-4 inline-block mr-2 text-primary" />
          <span className="text-primary">Forms</span>
        </DropdownOption>
        <DropdownOption href="/" on_click={handleLogout}>
          <LogOut className="text-red-500 w-4 h-4 inline-block mr-2" />
          <span className="text-red-500">Sign Out</span>
        </DropdownOption>
      </GroupableNavDropdown>
    </div>
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
  const auth = useAuthContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [moaOnly, setMoaOnly] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const noProfileRoutes = ["/register", "/register/verify"];
  const noHeaderRoutes = ["/register", "/register/verify"];
  const showProfileButton = routeExcluded(noProfileRoutes);

  // show filters on /search (allow subpaths)
  const showFilters = pathname?.startsWith("/search") === true;

  // lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // hydrate search input + moa from URL
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
          "flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-gray-100 z-[90]",
          isMobile ? "px-4 py-3" : "py-4 px-8"
        )}
        style={{ overflow: "visible", position: "relative", zIndex: 100 }}
      >
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <HeaderTitle />
        </div>

        {/* Center: Desktop search + filters (only on /search) */}
        {!isMobile && showProfileButton && (
          <div className="flex items-center gap-4 w-full max-w-2xl">
            {showFilters && (
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
            )}

            {showFilters && (
              <JobFilterProvider initial={initialFromUrl}>
                <JobFilters isDesktop onApply={onApplyFilters} />
              </JobFilterProvider>
            )}
          </div>
        )}

        {/* Right: Desktop profile / Mobile burger */}
        {showProfileButton ? (
          isMobile ? (
            auth.isAuthenticated() ? (
              <button
                type="button"
                aria-label="Open menu"
                className="inline-flex items-center justify-center h-10 w-10 rounded-md border border-gray-300 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
            ) : (
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`)
                }
              >
                Sign in
              </Button>
            )
          ) : (
            <div className="flex items-center gap-6">
              <ProfileButton />
            </div>
          )
        ) : (
          <div className="w-1 h-10 bg-transparent" />
        )}
      </div>

      {/* Mobile: search + (filters only on /search) */}
      {isMobile && showProfileButton && showFilters && (
        <JobFilterProvider initial={initialFromUrl}>
          <div className="flex flex-col max-w-2xl w-full gap-2 items-center px-4 pt-3 bg-white/80">
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
            {/* Mobile button opening bottom sheet */}
            <JobFilters onApply={onApplyFilters} />
          </div>
        </JobFilterProvider>
      )}

      {/* Mobile drawer */}
      {isMobile && showProfileButton && (
        <MobileDrawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      )}
    </div>
  ) : (
    <></>
  );
};

export default Header;
