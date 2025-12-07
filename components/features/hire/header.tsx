"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useAuthContext } from "@/app/hire/authctx";
import { useRouter, usePathname, useSearchParams} from "next/navigation";
import { LogOut,
          Building,
          UserPlus,
          XIcon,
          MessageCircleMore,
          ChevronRight,
          Search,
          Settings, 
          LayoutDashboard,
          Menu,
          FileUser,
          Plus,
          HelpCircle,
          } from "lucide-react";
import { useAppContext } from "@/lib/ctx-app";
import { DropdownOption, GroupableNavDropdown } from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HeaderTitle } from "@/components/shared/header";
import { useRoute } from "@/hooks/use-route";
import Link from "next/link";
import { getFullName } from "@/lib/profile";
import { MyEmployerPfp } from "@/components/shared/pfp";
import { useProfile } from "@/hooks/use-employer-api";
import { useMobile } from "@/hooks/use-mobile";
import { useConversations } from "@/hooks/use-conversation";
import { useGlobalModal } from "@/components/providers/ModalProvider";
import { useQueryClient } from "@tanstack/react-query";
import { MyUserPfp } from "@/components/shared/pfp";
import { Separator } from "@/components/ui/separator";

/**
 * The header present on every page
 *
 * @component
 */
export const Header: React.FC = () => {
  const { isMobile } = useMobile();
  const { god } = useAuthContext();
  const { routeExcluded } = useRoute();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const noProfileRoutes = ["/login", "/register"];
  const noHeaderRoutes: string[] = [];
  const showProfileButton = routeExcluded(noProfileRoutes);

  useEffect(() => {
      document.body.style.overflow = isMenuOpen ? "hidden" : "";
      return () => {
        document.body.style.overflow = "";
      };
    }, [isMenuOpen]);

  return routeExcluded(noHeaderRoutes) ? (
    <div className="flex flex-col">
      <div className={cn(
                "flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-gray-100 z-[90]",
                isMobile ? "px-4 py-3" : "py-4 px-8"
              )}
              style={{ overflow: "visible", position: "relative", zIndex: 100 }}>
        <div className="flex items-center gap-3">
            <HeaderTitle />
        </div>
        {god && (
          <div className="w-full px-4 flex flex-row justify-end z-[100]">
            <Link href={"/god"}>
              <Button scheme="destructive" className="hover:bg-destructive/85">
                GOD
              </Button>
            </Link>
          </div>
        )}
        {/* {routeExcluded(noProfileRoutes) ? (
          <ProfileButton />
        ) : (
          <div className="w-1 h-10 bg-transparent"></div>
        )} */}
        {/* Right: Desktop profile / Mobile burger & floating action button*/}
          {showProfileButton ? (
            isMobile ? (
                  <button
                    type="button"
                    aria-label="Open menu"
                    className="inline-flex items-center justify-center h-10 w-10 rounded-md border border-gray-300 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(true)}
                  >
                    <Menu className="h-5 w-5" />
                  </button>
              )  : (
              <div className="flex items-center gap-6">
                <ProfileButton />
              </div>
            )
          ) : (
            <div className="w-1 h-10 bg-transparent" />
          )}
          </div>

          {isMobile && showProfileButton && (
            <MobileDrawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
          )}
        </div>
        
  ) : (
    <></>
  );
};

/**
 * A dropdown menu for the other parts of the site
 *
 * @component
 */
export const ProfileButton = () => {
  const router = useRouter();
  const { data: profile } = useProfile();
  const { user, isAuthenticated: is_authenticated, logout } = useAuthContext();

  const handle_logout = () => {
    logout().then(() => {
      router.push("/");
    });
  };

  const displayName = useMemo(() => {
    if (!profile) return "Employer";
    const name = profile?.name ?? "";
    return name.length > 32 ? name.slice(0, 32) + "..." : name;
  }, [profile]);

  return is_authenticated() ? (
    <div className="relative z-[100]">
      <GroupableNavDropdown
        display={
          <>
            <div className="overflow-hidden rounded-full flex flex-row items-center justify-center">
              <MyEmployerPfp size="7" />
            </div>
            {displayName}
          </>
        }
      >
        <DropdownOption href="/company-profile">
          <Building className="w-4 h-4 inline-block m-1 mr-2" />
          Company Profile
        </DropdownOption>
        {/* <DropdownOption href="/company-users">
          <UserPlus className="w-4 h-4 inline-block m-1 mr-2" />
          Manage Accounts
        </DropdownOption> */}
        <DropdownOption href="/login" on_click={handle_logout}>
          <LogOut className="text-red-500 w-4 h-4 inline-block m-1 mr-2" />
          <span className="text-red-500">Sign Out</span>
        </DropdownOption>
      </GroupableNavDropdown>
    </div>
  ) : (
    <Button
      type="button"
      variant="outline"
      size="md"
      className="h-10 border-gray-300 hover:bg-gray-50 "
      onClick={() => router.push("/login")}
    >
      Sign in 
    </Button>
  );
};

/* =======================================================================================
   Mobile Drawer (account on top → chats → links → bottom sign out)
======================================================================================= */
function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const profile = useProfile();
  const { isAuthenticated, logout } = useAuthContext();
  const conversations = useConversations();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const handleLogout = () => logout().then(() => router.push("/"));

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
                    {profile.data?.name}
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
                  <li>
                    <Link href="/listings/create" className="block w-full">
                      <button className="w-full flex items-center justify-between rounded-md px-3 py-2 bg-primary hover:opacity-50 border border-transparent text-sm">
                        <div className="text-white">
                          <Plus className="w-4 h-4 inline-block mr-2" />
                          <span>Create Listing</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white" />
                      </button>
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" className="block w-full">
                      <button className="w-full flex items-center justify-between rounded-md px-3 py-2 hover:bg-gray-50 border border-transparent hover:border-gray-200 text-sm">
                        <div>
                          <LayoutDashboard className="w-4 h-4 inline-block mr-2" />
                          <span>Dashboard</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </button>
                    </Link>
                  </li>
                  {/* <li>
                    <Link href="/forms-management" className="block w-full">
                      <button className="w-full flex items-center justify-between rounded-md px-3 py-2 hover:bg-gray-50 border border-transparent hover:border-gray-200 text-sm">
                        <div>
                          <FileUser className="w-4 h-4 inline-block mr-2" />
                          <span>Forms Automation</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </button>
                    </Link>
                  </li> */}
                  {isAuthenticated() && (
                    <li>
                      <Link href="/conversations" className="block w-full">
                        <button className="w-full flex items-center justify-between rounded-md px-3 py-2">
                          <span className="inline-flex items-center gap-2 text-sm">
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
                  )}
                  <li>
                    <Link href="/company-profile">
                      <button
                        className="w-full flex items-center justify-between rounded-md px-3 py-2 hover:bg-gray-50 border border-transparent hover:border-gray-200 text-sm text-primary"
                      >
                        <div>
                          <Building className="w-4 h-4 inline-block mr-2" />
                          <span>Company Profile</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </button>
                    </Link>
                  </li>
                  <li>
                    <Link href="/help">
                      <button
                        className="w-full flex items-center justify-between rounded-md px-3 py-2 hover:bg-gray-50 border border-transparent hover:border-gray-200 text-sm text-primary"
                      >
                        <div>
                          <HelpCircle className="w-4 h-4 inline-block mr-2" />
                          <span>Help</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </button>
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          )}

          {/* Footer pinned to bottom */}
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

export default Header;
