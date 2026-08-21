"use client";

import { usePathname } from "next/navigation";
import HireAppHeader from "@/components/features/hire/app-header";
import { Footer } from "@/components/shared/footer";
import { Suspense } from "react";

export default function AllowLanding({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isStudentLanding = pathname === "/";
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/register");
  const hideHeader = isStudentLanding || pathname === "/welcome" || isAuthRoute;

  return (
    <div className="h-svh flex flex-col overflow-y-auto">
      <Suspense>{!hideHeader && <HireAppHeader />}</Suspense>
      <div className="grow overflow-auto flex flex-col ">{children}</div>
      {!isStudentLanding && <Footer />}
    </div>
  );
}
