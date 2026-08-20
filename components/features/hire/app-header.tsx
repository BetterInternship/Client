"use client";

import { useAuthContext } from "@/app/hire/authctx";
import { useProfile } from "@/hooks/use-employer-api";
import { useMobile } from "@/hooks/use-mobile";
import { usePathname, useRouter } from "next/navigation";
import { AppHeader, Button, type NavItem } from "@betterinternship/components";
import { Briefcase, HelpCircle, Plus, UserCircle } from "lucide-react";

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
    { href: "/listings/create", label: "Add Listing", icon: Plus },
    { href: "/dashboard", label: "Job listings", icon: Briefcase },
    { href: "/help", label: "Help", icon: HelpCircle },
  ];

  return (
    <AppHeader
      portal="Recruiters"
      brand="BetterInternship"
      logoPath="/BetterInternshipLogo.png"
      homeHref="/dashboard"
      nav={nav}
      userPrimary={profile?.name}
      userSecondary={user?.email}
      logout={logout}
      postLogoutPath="/"
      accountNav={[{ href: "/account", label: "Account", icon: UserCircle }]}
      actions={
        god ? (
          <Button
            scheme="destructive"
            className="hover:bg-destructive/85"
            onClick={() => {
              void handleGodClick();
            }}
          >
            GOD
          </Button>
        ) : undefined
      }
    />
  );
}

export default HireAppHeader;
