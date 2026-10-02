"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BookA,
  ChevronDown,
  Home,
  LogOut,
  Newspaper,
  UserRound,
} from "lucide-react";
import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@betterinternship/components";
import { useAuthContext } from "@/lib/ctx-auth";
import { useProfileData } from "@/lib/api/student.data.api";
import { hasFormsEnabledUniversity } from "@/lib/student-forms-access";
import { usePfpUrl } from "@/hooks/use-pfp";
import { savePostLoginRedirect } from "@/lib/post-login-redirect";

/** Minimal editorial navigation, in normal flow over the page's artwork. */
export function TopPageNavbar({ disabled }: { disabled?: boolean }) {
  const auth = useAuthContext();
  const authenticated = auth.isAuthenticated();
  const profile = useProfileData();
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const queryClient = useQueryClient();
  const { url: avatarUrl } = usePfpUrl({
    id: "me",
    source: "users",
    enabled: authenticated && !disabled,
  });
  const logout = useMutation({
    mutationFn: auth.logout,
    onSettled: () => {
      queryClient.clear();
      router.replace("/");
    },
  });
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);
  const profileUser = profile.data as {
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
  } | null;
  const userPrimary = [profileUser?.first_name, profileUser?.last_name]
    .filter(Boolean)
    .join(" ");
  const links = [
    { href: "/search", label: "Home", icon: Home },
    ...(hasFormsEnabledUniversity(profile.data)
      ? [{ href: "/forms", label: "Forms", icon: Newspaper }]
      : []),
    { href: "/applications", label: "My Jobs", icon: BookA },
  ];
  const actionClass =
    "relative h-auto min-h-11 min-w-0 flex-col items-center justify-center gap-1 rounded-[0.33em] px-3 py-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";
  const brand = (
    <>
      <Image
        src="/BetterInternshipLogo.png"
        alt=""
        width={28}
        height={28}
        className="shrink-0"
      />
      <span className="whitespace-nowrap text-base font-bold tracking-tight text-gray-900 sm:text-lg">
        BetterInternship
      </span>
    </>
  );

  const handleLogin = () => {
    savePostLoginRedirect(
      `${window.location.pathname}${window.location.search}`,
    );
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <nav
      aria-label="Top page navigation"
      className={cn(
        "relative mx-auto flex min-h-[72px] w-full max-w-[1240px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8",
        authenticated && !disabled && "flex-wrap py-3 sm:flex-nowrap sm:py-0",
      )}
    >
      {disabled ? (
        <span className="inline-flex items-center gap-2">{brand}</span>
      ) : (
        <Link
          href="/search"
          aria-label="BetterInternship home"
          className="inline-flex shrink-0 items-center gap-2 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          {brand}
        </Link>
      )}
      {authenticated && !disabled ? (
        <div className="flex w-full items-center justify-end gap-1 sm:w-auto sm:gap-2">
          {links.map(({ href, label, icon: Icon }) => (
            <Button
              key={href}
              asChild
              variant="ghost"
              className={cn(
                actionClass,
                isActive(href)
                  ? "text-primary"
                  : "opacity-80 hover:bg-gray-100 hover:opacity-100",
              )}
            >
              <Link href={href}>
                <Icon
                  className="h-6! w-6!"
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
                <span className="text-xs">{label}</span>
              </Link>
            </Button>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  actionClass,
                  "group w-20 px-2",
                  isActive("/profile")
                    ? "text-primary"
                    : "opacity-80 hover:bg-gray-100 hover:opacity-100",
                )}
              >
                <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt=""
                      width={24}
                      height={24}
                      unoptimized
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <UserRound
                      className="h-5 w-5 text-gray-500"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <span className="flex items-center gap-0.5 text-xs">
                  Account{" "}
                  <ChevronDown
                    className="h-3! w-3! transition-transform group-data-[state=open]:rotate-180"
                    aria-hidden="true"
                  />
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-max min-w-44">
              {userPrimary && (
                <div className="px-2 py-1.5">
                  <div className="text-center text-sm font-medium">
                    {userPrimary}
                  </div>
                  {profileUser?.email && (
                    <div className="text-center text-xs text-muted-foreground">
                      {profileUser.email}
                    </div>
                  )}
                </div>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                disabled={logout.isPending}
                onClick={() => logout.mutate()}
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                {logout.isPending ? "Logging out..." : "Sign Out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="md"
          disabled={disabled}
          onClick={handleLogin}
          className="min-h-11 shrink-0 bg-transparent px-3 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:px-6"
        >
          Log in
        </Button>
      )}
    </nav>
  );
}
