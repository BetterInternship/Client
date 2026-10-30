"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { BookA, Home, Newspaper } from "lucide-react";
import clsx from "clsx";
import { useAuthContext } from "@/lib/ctx-student-auth";
import { useHeaderContext } from "@/lib/ctx-header";
import { hasFormsEnabledUniversity } from "@/lib/student-forms-access";
import { useNavigationBehavior } from "./navigation-behavior";
import {
  isStudentLinkActive,
  studentCoreLinks,
  studentNavigationPolicy,
} from "./navigation-config";
import { StudentAccountMenu, studentPublicLinks } from "./student-navigation";

const icons = { Home, Forms: Newspaper, "My Jobs": BookA };

export function StudentBottomNavigation() {
  const auth = useAuthContext();
  const params = useParams();
  const policy = studentNavigationPolicy(
    usePathname(),
    typeof params?.university === "string",
  );
  const { navigationHidden } = useHeaderContext();
  const { hidden } = useNavigationBehavior();
  if (!auth.user || navigationHidden || !policy.bottom) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-[calc(4rem_+_env(safe-area-inset-bottom))] md:hidden">
      <nav
        data-student-navigation
        data-mobile-bottom-nav
        aria-label="Mobile student navigation"
        aria-hidden={hidden || undefined}
        inert={hidden || undefined}
        className={clsx(
          "absolute inset-0 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-3px_12px_rgb(16_16_68_/_0.03)] motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-landing-out motion-reduce:transition-none",
          hidden
            ? "translate-y-full pointer-events-none"
            : "pointer-events-auto",
        )}
      >
        <div className="flex h-16 items-stretch">
          {studentCoreLinks(hasFormsEnabledUniversity(auth.user)).map(
            (link) => {
              const Icon = icons[link.label as keyof typeof icons];
              const active = isStudentLinkActive(policy.path, link.href);
              return (
                <Link
                  href={link.href}
                  key={link.href}
                  aria-current={active ? "page" : undefined}
                  className={clsx(
                    "flex h-16 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium hover:bg-gray-100 hover:text-landing-blue focus-visible:outline-2 focus-visible:outline-landing-blue",
                    active ? "text-landing-blue" : "text-gray-600",
                  )}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                  <span>{link.label}</span>
                </Link>
              );
            },
          )}
          <div className="min-w-0 flex-1">
            <StudentAccountMenu
              bottom
              secondary={policy.publicLinks ? studentPublicLinks() : []}
            />
          </div>
        </div>
      </nav>
    </div>
  );
}
