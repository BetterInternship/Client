"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  User,
  Settings,
  BookA,
  Heart,
  LogOut,
  HelpCircle,
  MessageCircleMore,
} from "lucide-react";
import { useAppContext } from "@/lib/ctx-app";
import { DropdownOption, GroupableNavDropdown } from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HeaderTitle } from "@/components/shared/header";
import { useRoute } from "@/hooks/use-route";
import { MyUserPfp } from "@/components/shared/pfp";
import { getFullName, getMissingProfileFields } from "@/lib/utils/user-utils";
import { useProfile } from "@/lib/api/student.api";
import CompleteAccBanner from "@/components/features/student/CompleteAccBanner";
import { useAuthContext } from "@/lib/ctx-auth";
import Link from "next/link";
import { useConversations } from "@/hooks/use-conversation";

/**
 * The header present on every page
 *
 * @component
 */
export const Header = () => {
  const { isMobile } = useAppContext();
  const header_routes = ["/login", "/register", "/otp"];
  const { routeExcluded } = useRoute();
  const router = useRouter();
  const profile = useProfile();
  const pathname = usePathname();

  const [hasMissing, setHasMissing] = useState(false);

  useEffect(() => {
    if (profile.data) {
      const { missing } = getMissingProfileFields(profile.data);
      setHasMissing(Array.isArray(missing) && missing.length > 0);
    }
    // Only run on mount/profile fetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.data]);

  return (
    <>
      <div
        className={cn(
          "flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-gray-100 z-[90]",
          isMobile ? "px-6 py-4" : "py-4 px-8"
        )}
        style={{
          overflow: "visible",
          position: "relative",
          zIndex: 100,
        }}
      >
        <div className="flex items-center gap-4">
          <HeaderTitle />
        </div>
        {routeExcluded(header_routes) ? (
          <div className="flex items-center gap-6">
            {!isMobile && pathname === "/search" && hasMissing && (
              <button
                className="text-base ml-4 text-blue-700 font-medium hover:underline focus:outline-none"
                onClick={() => router.push("/profile?edit=true")}
              >
                Finish your profile to start applying!
              </button>
            )}
            <ProfileButton />
          </div>
        ) : (
          <div className="w-1 h-10 bg-transparent"></div>
        )}
      </div>
      {isMobile && pathname === "/search" && <CompleteAccBanner />}
    </>
  );
};

/**
 * A dropdown menu for the other parts of the site
 *
 * @component
 */
export const ProfileButton = () => {
  const profile = useProfile();
  const conversations = useConversations();
  const { isAuthenticated, logout } = useAuthContext();
  const router = useRouter();

  const handle_logout = () => {
    logout().then(() => {
      router.push("/");
    });
  };

  return isAuthenticated() ? (
    <div className="relative flex flex-row items-center gap-2">
      <Link href="/conversations">
        <Button variant="outline" className="relative">
          <span className="text-xs">Chats</span>{" "}
          <MessageCircleMore className="w-6 h-6" />
          {conversations?.unreads?.length ? (
            <div className="absolute w-3 h-3 top-[-0.33em] right-[-0.4em] rounded-full bg-warning opacity-70"></div>
          ) : (
            <></>
          )}
        </Button>
      </Link>
      <GroupableNavDropdown
        display={
          <>
            <div className="overflow-hidden rounded-full flex flex-row items-center justify-center">
              <MyUserPfp size="7" />
            </div>
            {getFullName(profile.data)}
          </>
        }
        content={
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-xs text-gray-500 text-ellipsis overflow-hidden">
              {profile.data?.email}
            </p>
          </div>
        }
        className="z-[200]"
      >
        <DropdownOption href="/profile">
          <Settings className="w-4 h-4 inline-block m-1 mr-2" />
          Profile Settings
        </DropdownOption>
        <DropdownOption href="/applications">
          <BookA className="w-4 h-4 inline-block m-1 mr-2" />
          Applications
        </DropdownOption>
        <DropdownOption href="/saved">
          <Heart className="w-4 h-4 inline-block m-1 mr-2" />
          Saved Jobs
        </DropdownOption>
        <DropdownOption href="/help">
          <HelpCircle className="w-4 h-4 inline-block m-1 mr-2" />
          Help Center
        </DropdownOption>
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

export default Header;
