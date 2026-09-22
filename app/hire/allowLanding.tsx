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
  const isAuthRoute = pathname === "/login" || pathname.startsWith("/register");
  const hideHeader = isStudentLanding || isAuthRoute;

  return (
    <>
      <Suspense>{!hideHeader && <HireAppHeader />}</Suspense>
      <div className="flex min-h-0 grow flex-col">{children}</div>
      {!isStudentLanding && <Footer />}
    </>
  );
}
