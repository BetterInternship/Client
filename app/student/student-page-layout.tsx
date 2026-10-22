"use client";

import { useParams, usePathname } from "next/navigation";
import StudentAppHeader from "@/components/features/student/app-header";
import { Footer } from "@/components/shared/footer";
import { Suspense } from "react";
import { studentNavigationPolicy } from "@/components/features/student/navigation/navigation-config";
import { useAuthContext } from "@/lib/ctx-student-auth";
import { StudentSessionGate } from "@/components/providers/student-session-gate";
import { isPrivateStudentRoute } from "@/lib/student-public-routes";

/**
 * Chooses the layout around student pages.
 * Adds the shared header/footer unless a page owns its layout, places protected
 * content behind StudentSessionGate, and resets private page state on account changes.
 * The gate handles session loading and login redirects; the API still checks access.
 */
export default function StudentPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const { user } = useAuthContext();
  // Only university routes have this parameter; they draw their own Top navbar.
  const isTopPage = typeof params?.university === "string";
  const policy = studentNavigationPolicy(pathname, isTopPage);
  const isPrivatePage = isPrivateStudentRoute(pathname);
  const requiresSession = isPrivatePage || policy.path === "/register/verify";
  const isStudentLanding = policy.landing;
  // Guides provide their own surrounding layout.
  if (policy.guides) {
    return (
      <div className="flex min-h-0 grow flex-col bg-white">{children}</div>
    );
  }
  const hideSharedHeader = policy.pageOwnedHeader;

  // Landing, Top, and custom-layout pages provide their own headers.
  if (hideSharedHeader) {
    return (
      <div className="flex min-h-0 grow flex-col bg-gray-50">
        {children}
        {!isStudentLanding && (
          <div className="mt-auto hidden md:block">
            <Footer />
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <Suspense>
        <StudentAppHeader />
      </Suspense>
      {/* A new account gets a fresh private page, without the previous user's edits. */}
      <div
        key={isPrivatePage ? (user?.id ?? "unverified") : "public-content"}
        className="flex min-h-0 grow flex-col"
      >
        {requiresSession ? (
          <StudentSessionGate>{children}</StudentSessionGate>
        ) : (
          children
        )}
      </div>
      <div className="mt-auto hidden md:block">
        <Footer />
      </div>
    </>
  );
}
