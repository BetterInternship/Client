"use client";

import { useAuthContext } from "@/app/hire/authctx";
import { useProfile } from "@/hooks/use-employer-api";
import { usePfpUrl } from "@/hooks/use-pfp";
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
  ShieldAlert,
  UserCircle,
} from "lucide-react";

/**
 * Hire portal header built on the shared package AppHeader.
 *
 * @component
 */
export function HireAppHeader() {
  const { impersonating, stopImpersonating, user, logout } = useAuthContext();
  const { data: profile } = useProfile();

  // The hire-side "profile picture" is the company logo (uploaded in
  // account > company). Empty until it resolves, so AppHeader falls back to
  // its own icon rather than flashing a broken image.
  const { url: logoUrl } = usePfpUrl({
    id: "me",
    source: "employer",
    enabled: !!user,
  });

  const nav: NavItem[] = [
    { href: "/listings/create", label: "Add listing", icon: Plus },
    { href: "/dashboard", label: "Dashboard", icon: Briefcase },
    { href: "/help", label: "Get help", icon: HelpCircle },
  ];

  // The one piece of god UI left on the hire site (TOOLS_SITE_PLAN.md T16):
  // while a god is signed in as this employer from the tools site, say so,
  // and offer the way back. Driven by the server, so a reload keeps it.
  const stopLabel = `Viewing as ${profile?.name ?? "this employer"}`;
  const impersonationControl = impersonating ? (
    <>
      <button
        type="button"
        onClick={() => {
          void stopImpersonating();
        }}
        className="flex w-full items-center justify-between rounded-[0.33em] border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/15 md:hidden"
      >
        <div className="flex min-w-0 items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span className="truncate">{stopLabel} · Stop</span>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0" />
      </button>
      <Button
        variant="ghost"
        title={stopLabel}
        className={cn(
          "relative hidden h-auto min-w-0 flex-col items-center justify-center gap-1 rounded-[0.33em] px-3 py-1 md:flex",
          "bg-destructive/10 text-destructive hover:bg-destructive/15! hover:text-destructive!",
        )}
        onClick={() => {
          void stopImpersonating();
        }}
      >
        <ShieldAlert className="h-6! w-6!" strokeWidth={1.7} />
        <span className="text-xs">Stop viewing</span>
      </Button>
    </>
  ) : undefined;

  return (
    <AppHeader
      siteName="Recruiter Portal"
      brand="BetterInternship"
      logoPath="/BetterInternshipLogo.png"
      homeHref="/dashboard"
      nav={nav}
      userPrimary={profile?.name}
      userSecondary={user?.email}
      userAvatarUrl={logoUrl || null}
      logout={logout}
      postLogoutPath="/"
      accountNav={[{ href: "/account", label: "Account", icon: UserCircle }]}
      actions={impersonationControl}
    />
  );
}

export default HireAppHeader;
