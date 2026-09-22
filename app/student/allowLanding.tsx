"use client";

import { usePathname } from "next/navigation";
import StudentAppHeader from "@/components/features/student/app-header";
import { Suspense } from "react";

export default function AllowLanding({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isStudentLanding = pathname === "/";
  const isChallengePage =
    pathname.startsWith("/challenges/") ||
    pathname.startsWith("/student/challenges/");
  const hideSharedHeader =
    isStudentLanding || pathname.startsWith("/companies/") || isChallengePage;

  if (hideSharedHeader) {
    return <div className="flex min-h-0 grow flex-col bg-gray-50">{children}</div>;
  }

  return (
    <>
      <Suspense>
        <StudentAppHeader />
      </Suspense>
      <div className="flex min-h-0 grow flex-col">{children}</div>
    </>
  );
}
