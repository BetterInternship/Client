"use client";

import React, { useMemo } from "react";
import { useAuthContext } from "@/app/hire/authctx";
import { useRouter } from "next/navigation";
import { LogOut, Building, UserPlus } from "lucide-react";
import { useAppContext } from "@/lib/ctx-app";
import { DropdownOption, GroupableNavDropdown } from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HeaderTitle } from "@/components/shared/header";
import { useRoute } from "@/hooks/use-route";
import Link from "next/link";
import { getFullName } from "@/lib/utils/user-utils";
import { MyEmployerPfp } from "@/components/shared/pfp";
import { useProfile } from "@/hooks/use-employer-api";

/**
 * The header present on every page
 *
 * @component
 */
export const Header = () => {
  const { god } = useAuthContext();
  const { routeExcluded } = useRoute();
  const noProfileRoutes = ["/login", "/register"];
  const noHeaderRoutes: string[] = [];

  return routeExcluded(noHeaderRoutes) ? (
    <div className="relative flex py-3 px-6 justify-between items-center bg-white backdrop-blur-md border-b border-gray-100 z-[100]">
      <HeaderTitle />
      {god && (
        <div className="w-full px-4 flex flex-row justify-end z-[100]">
          <Link href={"/god"}>
            <Button scheme="destructive" className="hover:bg-destructive/85">
              GOD
            </Button>
          </Link>
        </div>
      )}
      {routeExcluded(noProfileRoutes) ? (
        <ProfileButton />
      ) : (
        <div className="w-1 h-10 bg-transparent"></div>
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
        content={
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900">
              {getFullName(user)}
            </p>
            <p className="text-xs text-gray-500 text-ellipsis overflow-hidden">
              {user?.email}
            </p>
          </div>
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
      Sign in to Existing Account.
    </Button>
  );
};

export default Header;
