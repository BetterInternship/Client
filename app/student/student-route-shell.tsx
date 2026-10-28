"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { isLightweightStudentRoute } from "@/lib/student-public-routes";

const StudentAppShell = dynamic(() => import("./student-app-shell"), {
  loading: () => (
    <div className="min-h-[100svh] bg-background" role="status">
      <span className="sr-only">Loading student application</span>
    </div>
  ),
});

export default function StudentRouteShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isPublicPage = isLightweightStudentRoute(pathname);
  const [appActivated, setAppActivated] = useState(!isPublicPage);

  // Once entered, keep the app mounted even on return to the homepage:
  // in-flight form jobs, query state, and authentication must survive navigation.
  if (!isPublicPage && !appActivated) setAppActivated(true);

  if (appActivated || !isPublicPage) {
    return <StudentAppShell>{children}</StudentAppShell>;
  }

  return (
    <div className="fixed inset-x-0 top-0 flex h-[100svh] flex-col overflow-hidden bg-background md:relative md:h-[100dvh]">
      <div
        data-student-scroll
        className="relative flex min-h-0 flex-1 max-w-[100svw] overflow-y-auto flex-col"
      >
        <div className="flex min-h-0 grow flex-col bg-gray-50">{children}</div>
      </div>
    </div>
  );
}
