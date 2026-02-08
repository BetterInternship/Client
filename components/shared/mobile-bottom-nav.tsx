"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  Newspaper,
  BookA,
  User,
  Settings,
  LogOut,
  CheckSquare,
  Heart,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  isProfileBaseComplete,
  isProfileResume,
  isProfileVerified,
} from "@/lib/profile";
import { useAuthContext } from "@/lib/ctx-auth";

interface MobileBottomNavProps {
  profileData?: any;
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
        "flex-1 flex flex-col items-center justify-center h-full gap-0.5 text-xs font-medium transition-colors border rounded",
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

  // Not logged in: show minimal nav with Search and Sign In
  if (!isAuthenticated()) {
    return (
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white shadow-lg flex justify-around items-center h-16">
        {/* Search Button */}
        <NavButton
          icon={<Search className="w-6 h-6" />}
          label="Search"
          isActive={pathname === "/search"}
          onClick={() => router.push("/search")}
        />

        {/* Sign In Button */}
        <NavButton
          icon={<LogIn className="w-6 h-6" />}
          label="Sign In"
          isActive={false}
          variant="accent"
          onClick={() =>
            router.push(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`)
          }
        />
      </div>
    );
  }

  // Logged in: show full navigation
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white shadow-lg flex justify-around items-center h-16">
      {/* Search Button */}
      <NavButton
        icon={<Search className="w-6 h-6" />}
        label="Search"
        isActive={pathname === "/search"}
        onClick={() => router.push("/search")}
      />

      {/* Forms Button */}
      <NavButton
        icon={<Newspaper className="w-6 h-6" />}
        label="Forms"
        isActive={pathname === "/forms"}
        onClick={() => router.push("/forms")}
      />

      {/* My Jobs Button with Popover Menu */}
      <NavButton
        icon={<BookA className="w-6 h-6" />}
        label="My Jobs"
        isActive={
          pathname?.startsWith("/applications") ||
          pathname?.startsWith("/saved")
        }
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
                router.push("/applications");
              }}
              className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors text-sm"
            >
              <div className="flex items-center">
                <CheckSquare className="w-4 h-4 inline-block mr-2 text-primary" />
                <span>Applications</span>
              </div>
            </button>
            <button
              onClick={() => {
                router.push("/saved");
              }}
              className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors text-sm"
            >
              <div className="flex items-center">
                <Heart className="w-4 h-4 inline-block mr-2 text-primary" />
                <span>Saved Jobs</span>
              </div>
            </button>
          </div>
        </PopoverContent>
      </NavButton>

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
                try {
                  if (profileData && "data" in profileData) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                    const profile = profileData.data;
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    if (!isProfileVerified(profile || null)) {
                      router.push(`/register/verify`);
                    } else if (
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                      !isProfileResume(profile || null) ||
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                      !isProfileBaseComplete(profile || null)
                    ) {
                      router.push(`/profile/complete-profile?dest=profile`);
                    } else {
                      router.push(`/profile`);
                    }
                  } else {
                    router.push(`/profile`);
                  }
                } catch {
                  router.push(`/profile`);
                }
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
  );
};

export default MobileBottomNav;
