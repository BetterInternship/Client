"use client";

import { useParams, usePathname } from "next/navigation";
import StudentAppHeader from "@/components/features/student/app-header";
import { Footer } from "@/components/shared/footer";
import { Suspense } from "react";
import { StudentSessionGate } from "@/components/providers/student-session-gate";
import { isGuidesRoute } from "@/lib/student-public-routes";

export default function AllowLanding({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const path = pathname.replace(/^\/student(?=\/|$)/, "") || "/";
  const requiresSession =
    /^\/(?:profile|forms|applications|saved|discord)(?:\/|$)/.test(path) ||
    path === "/register/verify";
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
      <div className="flex min-h-0 grow flex-col">
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
