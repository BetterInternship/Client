"use client";

import { useAuthContext } from "@/app/hire/authctx";
import { useProfile } from "@/hooks/use-employer-api";
import { useMobile } from "@/hooks/use-mobile";
import { usePathname, useRouter } from "next/navigation";
import {
  AppHeader,
  type NavItem,
} from "@betterinternship/components/app-header";
import { Button, cn } from "@betterinternship/components";
import {
  Briefcase,
  ChevronRight,
  HelpCircle,
  Plus,
  ShieldCheck,
  UserCircle,
} from "lucide-react";

const MOBILE_HIDE_ROUTES = ["/dashboard/manage"];

/**
 * Hire portal header built on the shared package AppHeader.
 *
 * @component
 */
export function HireAppHeader() {
  const { isMobile } = useMobile();
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { god, proxy, exitProxy, user, logout } = useAuthContext();
  const { data: profile } = useProfile();

  // Proxying leaves the acting god's own identity shadowed by the employer
  // being viewed (setProxyCookie never gets undone on its own) — hopping back
  // to /god must restore it first, or every page after this stays "as" them.
  const handleGodClick = async () => {
    if (proxy) await exitProxy();
    router.push("/god");
  };

  if (isMobile && MOBILE_HIDE_ROUTES.includes(pathname)) return null;

  const nav: NavItem[] = [
    { href: "/listings/create", label: "Add listing", icon: Plus },
    { href: "/dashboard", label: "Dashboard", icon: Briefcase },
    { href: "/help", label: "Get help", icon: HelpCircle },
  ];

  const isGodActive = pathname.startsWith("/god");

  const adminButton = god ? (
    isMobile ? (
      <button
        type="button"
        onClick={() => {
          void handleGodClick();
        }}
        className={cn(
          "flex w-full items-center justify-between rounded-md border border-transparent px-3 py-2 text-sm transition-colors hover:border-gray-200 hover:bg-gray-50",
          isGodActive ? "text-primary" : "text-gray-700",
        )}
      >
        <div className="flex items-center gap-2 ">
          <ShieldCheck className="h-4 w-4 text-gray-500" />
          <span>Administrator</span>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-300" />
      </button>
    ) : (
      <Button
        variant="ghost"
        className={cn(
          "relative h-auto min-w-0 flex-col items-center justify-center gap-1 rounded-[0.33em] px-3 py-1 bg-destructive/10 text-destructive hover:bg-destructive/15! hover:text-destructive!",
          isGodActive
            ? "text-primary"
            : "opacity-80 hover:bg-gray-100 hover:opacity-100",
        )}
        onClick={() => {
          void handleGodClick();
        }}
      >
        <ShieldCheck className="h-6! w-6!" strokeWidth={1.7} />
        <span className="text-xs">Administrator</span>
      </Button>
    )
  ) : undefined;

  return (
    <AppHeader
      portal="Recruiters"
      brand="Partners"
      logoPath="/BetterInternshipLogo.png"
      homeHref="/dashboard"
      nav={nav}
      userPrimary={profile?.name}
      userSecondary={user?.email}
      logout={logout}
      postLogoutPath="/"
      accountNav={[{ href: "/account", label: "Account", icon: UserCircle }]}
      actions={adminButton}
    />
  );
}

export default HireAppHeader;
