"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import {
  BookA,
  ChevronDown,
  Home,
  LogOut,
  Newspaper,
  User,
  UserRound,
} from "lucide-react";
import clsx from "clsx";
import { Button } from "@betterinternship/components";
import { useAuthContext } from "@/lib/ctx-student-auth";
import { hasFormsEnabledUniversity } from "@/lib/student-forms-access";
import { startStudentLogin } from "@/lib/student-login";
import { useNavigationAvatar } from "./use-navigation-avatar";
import { useNavigationBehavior } from "./navigation-behavior";
import {
  isStudentLinkActive,
  navigationPresets,
  normalizeStudentPath,
  studentCoreLinks,
  type NavigationPreset,
  type StudentNavigationConfig,
  type StudentNavigationLink,
} from "./navigation-config";

const iconFor = { Home, Forms: Newspaper, "My Jobs": BookA };
const actionClass =
  "flex min-h-12 flex-col items-center justify-center gap-1 rounded-[.33em] px-3 py-1 text-xs font-normal text-gray-600 hover:bg-gray-100 hover:text-landing-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-blue";
const menuClass =
  "z-[150] min-w-44 rounded-md border border-landing-border bg-white p-1 text-sm text-gray-700 shadow-lg";
const menuItemClass =
  "flex min-h-11 cursor-pointer items-center gap-2 rounded px-3 py-2 outline-none data-highlighted:bg-landing-tint data-highlighted:text-landing-blue";

export function loginFromCurrentPage() {
  startStudentLogin();
}

/** Adapted from Package.Components AppHeader: presentation only; session owns logout/cache. */
export function StudentAccountMenu({
  secondary = [],
  bottom = false,
}: {
  secondary?: StudentNavigationLink[];
  bottom?: boolean;
}) {
  const auth = useAuthContext();
  const { reveal } = useNavigationBehavior();
  const avatar = useNavigationAvatar(bottom ? undefined : auth.user?.id);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const name = [auth.user?.first_name, auth.user?.last_name]
    .filter(Boolean)
    .join(" ");
  const signOut = async () => {
    setPending(true);
    setError(null);
    try {
      await auth.logout();
      window.location.assign("/");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not sign out. Please retry.",
      );
      setOpen(true);
    } finally {
      setPending(false);
    }
  };
  return (
    <Dropdown.Root
      modal={false}
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        reveal();
      }}
    >
      <Dropdown.Trigger
        data-student-menu
        aria-label="Account"
        className={clsx(
          actionClass,
          bottom
            ? "h-16 w-full flex-1 gap-0.5 rounded-none px-2 font-medium"
            : "w-20 px-2",
        )}
      >
        {bottom ? (
          <User className="h-6 w-6" />
        ) : (
          <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-gray-100">
            {avatar ? (
              <Image src={avatar} width={24} height={24} alt="" unoptimized />
            ) : (
              <UserRound className="h-5 w-5" />
            )}
          </span>
        )}
        <span className="flex items-center gap-0.5">
          Account{!bottom && <ChevronDown className="h-3 w-3" />}
        </span>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content
          data-student-navigation
          className={menuClass}
          side={bottom ? "top" : "bottom"}
          sideOffset={8}
          align="end"
        >
          {!bottom && (
            <div className="border-b border-landing-border px-3 py-2 text-center">
              <div className="font-medium">{name || "Your account"}</div>
              <div className="text-xs text-gray-500">{auth.user?.email}</div>
            </div>
          )}
          <Dropdown.Item asChild>
            <Link className={menuItemClass} href="/profile">
              <UserRound className="h-4 w-4" />
              Profile
            </Link>
          </Dropdown.Item>
          {secondary.map((link) => (
            <Dropdown.Item key={link.href} asChild>
              <Link className={menuItemClass} href={link.href}>
                {link.label}
              </Link>
            </Dropdown.Item>
          ))}
          <Dropdown.Separator className="my-1 h-px bg-gray-200" />
          <Dropdown.Item
            disabled={pending}
            onSelect={(event) => {
              event.preventDefault();
              void signOut();
            }}
            className={clsx(
              menuItemClass,
              "text-red-600 data-disabled:opacity-50",
            )}
          >
            <LogOut className="h-4 w-4" />
            {pending ? "Signing out…" : "Sign out"}
          </Dropdown.Item>
          {error && (
            <p role="alert" className="max-w-60 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}

export function StudentNavigation({
  preset = "app",
  config,
  links = [],
  search,
  mobileSearch,
  disabled = false,
  showActions = true,
  hidden = false,
  onLogin,
  className,
}: {
  preset?: NavigationPreset;
  config?: Partial<StudentNavigationConfig>;
  links?: StudentNavigationLink[];
  search?: ReactNode;
  mobileSearch?: ReactNode;
  disabled?: boolean;
  showActions?: boolean;
  hidden?: boolean;
  onLogin?: () => void;
  className?: string;
}) {
  const auth = useAuthContext();
  const path = normalizeStudentPath(usePathname());
  const behavior = useNavigationBehavior();
  const settings = { ...navigationPresets[preset], ...config };
  // Public headers keep the brand name; app headers use icon-only on mobile.
  const wordmarkClass = preset === "app" ? "hidden md:inline" : undefined;
  const authenticated = !disabled && auth.isAuthenticated();
  const core = studentCoreLinks(hasFormsEnabledUniversity(auth.user));
  const solid =
    settings.surface === "solid" || behavior.offset >= settings.solidAfter;
  const login = (
    <Button
      type="button"
      variant="outline"
      size="md"
      disabled={disabled}
      onClick={onLogin ?? loginFromCurrentPage}
      className="inline-flex min-h-10 items-center gap-2 rounded-md border border-landing-control bg-transparent px-[18px] py-2 text-base font-[550] leading-6 text-landing-nav hover:border-landing-blue hover:bg-landing-tint hover:text-landing-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-blue disabled:cursor-not-allowed disabled:opacity-50"
    >
      Log in
    </Button>
  );
  const checking = !disabled && auth.status === "checking";
  const account = checking ? (
    <span role="status" className="inline-block h-10 w-20 rounded bg-gray-100">
      <span className="sr-only">Checking account</span>
    </span>
  ) : authenticated ? (
    <StudentAccountMenu />
  ) : (
    login
  );
  return (
    <header
      data-student-navigation
      aria-hidden={hidden || undefined}
      inert={hidden || undefined}
      className={clsx(
        "student-navigation relative z-40 w-full motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-landing-out motion-reduce:transition-none",
        settings.desktop !== "static" && "md:sticky md:top-0",
        settings.mobile !== "static" && "max-md:sticky max-md:top-0",
        settings.mobile === "hide-on-scroll" &&
          behavior.hidden &&
          "max-md:-translate-y-full max-md:invisible",
        settings.desktop === "hide-on-scroll" &&
          behavior.hidden &&
          "md:-translate-y-full md:invisible",
        solid
          ? "bg-white"
          : settings.surface === "translucent"
            ? "bg-white/90 backdrop-blur-md"
            : "bg-transparent",
        hidden && "hidden",
        className,
      )}
    >
      <div className="flex min-h-[76px] w-full items-center gap-7 px-4 md:px-6 max-md:min-h-[72px] max-md:gap-3 max-md:py-3">
        {disabled ? (
          <span className="inline-flex shrink-0 items-center gap-3 text-lg font-[750] tracking-[-.0375rem] text-landing-navy max-md:gap-1.5 max-md:text-base">
            <Image src="/homepage-logo.png" width={24} height={24} alt="" />
            <span className={wordmarkClass}>BetterInternship</span>
          </span>
        ) : (
          <Link
            href="/"
            aria-label="BetterInternship home"
            className="inline-flex shrink-0 items-center gap-3 text-lg font-[750] leading-[1.5] tracking-[-.0375rem] text-landing-navy focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-landing-blue max-md:gap-1.5 max-md:text-base"
          >
            <Image src="/homepage-logo.png" width={24} height={24} alt="" />
            <span className={wordmarkClass}>BetterInternship</span>
          </Link>
        )}
        {showActions && (
          <>
            {!!links.length && (
              <>
                <nav
                  aria-label="Student resources"
                  className="hidden shrink-0 items-center gap-4 text-[15px] font-[550] text-landing-nav md:flex xl:gap-7"
                >
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={link.current ? "page" : undefined}
                      className="flex min-h-11 items-center rounded-sm text-landing-nav transition-colors duration-[180ms] hover:text-landing-blue focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-landing-blue aria-[current=page]:text-landing-blue"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </>
            )}
            {search && (
              <div className="hidden min-w-0 flex-1 md:flex">{search}</div>
            )}
            <nav
              aria-label="Student navigation"
              className={clsx(
                "ml-auto hidden shrink-0 items-center gap-1 md:flex",
              )}
            >
              {authenticated &&
                core.map((link) => {
                  const Icon = iconFor[link.label as keyof typeof iconFor];
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={
                        isStudentLinkActive(path, link.href)
                          ? "page"
                          : undefined
                      }
                      className={clsx(
                        actionClass,
                        "aria-[current=page]:text-landing-blue",
                      )}
                    >
                      <Icon
                        className="h-6 w-6"
                        strokeWidth={1.7}
                        aria-hidden="true"
                      />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              {account}
            </nav>
            <div className="ml-auto flex items-center gap-2 md:hidden">
              {mobileSearch}
              {checking ? (
                <span
                  className="inline-block h-10 w-20 rounded bg-gray-100"
                  role="status"
                >
                  <span className="sr-only">Checking account</span>
                </span>
              ) : (
                !authenticated && login
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}

export function studentPublicLinks(): StudentNavigationLink[] {
  return [
    { label: "Guides", href: "/guides" },
    {
      label: "For Companies",
      href:
        process.env.NEXT_PUBLIC_CLIENT_HIRE_URL ||
        "https://hire.betterinternship.com",
    },
  ];
}

export { actionClass as studentNavigationActionClass };
