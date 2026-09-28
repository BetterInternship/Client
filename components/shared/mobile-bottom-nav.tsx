"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, Newspaper, BookA, User, Settings, LogOut } from "lucide-react";
import {
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@betterinternship/components";
import { hasFormsEnabledUniversity } from "@/lib/student-forms-access";
import { useProfileData } from "@/lib/api/student.data.api";
import type { PublicUser } from "@/lib/db/db.types";
import { useAuthContext } from "@/lib/ctx-auth";

interface MobileBottomNavProps {
  profileData?: PublicUser | null;
}

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  variant?: "default" | "accent";
}

/**
 * Reusable nav button component for mobile bottom navigation
 */
const NavButton: React.FC<NavButtonProps> = ({
  icon,
  label,
  isActive,
  onClick,
  children,
  variant = "default",
}) => {
  const isAccent = variant === "accent";

  const buttonContent = (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 flex flex-col items-center justify-center h-full gap-0.5 text-xs font-medium transition-colors border py-2",
        isAccent
          ? "bg-primary/10 text-primary border-transparent hover:bg-primary/15"
          : isActive
            ? "border-transparent text-primary"
            : "border-transparent text-gray-600 hover:text-primary hover:bg-gray-100",
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  if (children) {
    return (
      <Popover>
        <PopoverTrigger asChild>{buttonContent}</PopoverTrigger>
        {children}
      </Popover>
    );
  }

  return buttonContent;
};

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  profileData,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, isAuthenticated } = useAuthContext();
  const profile = useProfileData();
  const authenticated = isAuthenticated();
  const [editing, setEditing] = useState(false);
  const showFormsTab = hasFormsEnabledUniversity(profileData ?? profile.data);

  useEffect(() => {
    if (!authenticated) return;
    let blurTimer: number | undefined;

    const updateEditing = () => {
      const element = document.activeElement;
      setEditing(
        element instanceof HTMLElement &&
          (element.isContentEditable ||
            (element instanceof HTMLInputElement &&
              ![
                "button",
                "checkbox",
                "file",
                "hidden",
                "radio",
                "reset",
                "submit",
              ].includes(element.type)) ||
            element instanceof HTMLTextAreaElement),
      );
    };

    const handleFocusOut = () => {
      window.clearTimeout(blurTimer);
      blurTimer = window.setTimeout(updateEditing, 0);
    };

    updateEditing();
    document.addEventListener("focusin", updateEditing);
    document.addEventListener("focusout", handleFocusOut);

    return () => {
      document.removeEventListener("focusin", updateEditing);
      document.removeEventListener("focusout", handleFocusOut);
      window.clearTimeout(blurTimer);
    };
  }, [authenticated]);

  // don't display bottom nav when signed out.
  if (!authenticated) return null;

  // Logged in: show full navigation
  return (
    <div
      className={cn(
        "shrink-0 border-t border-gray-200 bg-white shadow-lg md:hidden",
        editing && "invisible",
      )}
    >
      <div className="flex h-16 items-center justify-around">
        {/* Search Button */}
        <NavButton
          icon={<Home className="w-6 h-6" />}
          label="Home"
          isActive={pathname === "/search"}
          onClick={() => router.push("/search")}
        />

        {showFormsTab && (
          <NavButton
            icon={<Newspaper className="w-6 h-6" />}
            label="Forms"
            isActive={pathname === "/forms"}
            onClick={() => router.push("/forms")}
          />
        )}

        {/* My Jobs Button */}
        <NavButton
          icon={<BookA className="w-6 h-6" />}
          label="My Jobs"
          isActive={
            pathname?.startsWith("/applications") ||
            pathname?.startsWith("/saved")
          }
          onClick={() => router.push("/applications")}
        />

        {/* Account Button with Popover Menu */}
        <NavButton
          icon={<User className="w-6 h-6" />}
          label="Account"
          isActive={pathname === "/profile"}
        >
          <PopoverContent
            className="w-max p-1 bg-white border border-gray-200 rounded-[0.33em] shadow-lg"
            side="top"
            sideOffset={8}
            style={{ zIndex: 9999 }}
          >
            <div className="flex flex-col gap-0">
              <button
                onClick={() => {
                  router.push(`/profile`);
                }}
                className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors text-sm"
              >
                <div className="flex items-center">
                  <Settings className="w-4 h-4 inline-block mr-2 text-primary" />
                  <span>Profile</span>
                </div>
              </button>
              <div className="h-px bg-gray-200 my-1 mx-2" />
              <button
                onClick={() => {
                  void logout();
                  router.push("/");
                }}
                className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors text-sm"
              >
                <div className="flex items-center">
                  <LogOut className="text-red-500 w-4 h-4 inline-block mr-2" />
                  <span className="text-red-500">Sign Out</span>
                </div>
              </button>
            </div>
          </PopoverContent>
        </NavButton>
      </div>
      <div aria-hidden="true" className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
};

export default MobileBottomNav;
