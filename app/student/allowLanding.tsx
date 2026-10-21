"use client";

import { useParams, usePathname } from "next/navigation";
import StudentAppHeader from "@/components/features/student/app-header";
import { Footer } from "@/components/shared/footer";
import { Suspense } from "react";
import { useAuthContext } from "@/lib/ctx-student-auth";
import { StudentSessionGate } from "@/components/providers/student-session-gate";
import {
  isGuidesRoute,
  isPrivateStudentRoute,
} from "@/lib/student-public-routes";

export default function AllowLanding({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const { user } = useAuthContext();
  const path = pathname.replace(/^\/student(?=\/|$)/, "") || "/";
  const isPrivatePage = isPrivateStudentRoute(pathname);
  const requiresSession = isPrivatePage || path === "/register/verify";
  const isStudentLanding = pathname === "/";
  // Top pages draw their own navbar.
  const isTopPage = typeof params?.university === "string";
  if (isGuidesRoute(pathname)) {
    return (
      <div className="flex min-h-0 grow flex-col bg-white">{children}</div>
    );
  }
  const isChallengePage =
    pathname.startsWith("/challenges/") ||
    pathname.startsWith("/student/challenges/");
  const hideSharedHeader =
    isStudentLanding ||
    pathname.startsWith("/companies/") ||
    isChallengePage ||
    isTopPage;

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
