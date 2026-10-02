"use client";

import { useParams, usePathname } from "next/navigation";
import StudentAppHeader from "@/components/features/student/app-header";
import { Footer } from "@/components/shared/footer";
import { Suspense } from "react";

export default function AllowLanding({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isStudentLanding = pathname === "/";
  // Top pages live at /<university> and /<university>/top/<slug>, and draw
  // their own navbar. A university's URL name can't be told apart from any
  // other first path segment by its text, so this keys off the route itself:
  // only app/student/[university]/** has a `university` param.
  const isTopPage = typeof useParams()?.university === "string";
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
      <div className="flex min-h-0 grow flex-col">{children}</div>
      <div className="mt-auto hidden md:block">
        <Footer />
      </div>
    </>
  );
}
