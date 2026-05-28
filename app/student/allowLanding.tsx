"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/features/student/header";
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
    return (
      <div className="min-h-full bg-gray-50 flex flex-col">{children}</div>
    );
  }

  return (
    <div className="h-[100svh] bg-gray-50 flex flex-col overflow-y-auto">
      <Suspense>
        <Header />
      </Suspense>
      <div className="flex-grow overflow-auto flex flex-col">{children}</div>
    </div>
  );
}
