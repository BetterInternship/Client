"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/features/hire/header";
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
  const hideHeader = isStudentLanding || pathname === "/welcome" || isAuthRoute;

  return (
    <div className="h-[100svh] bg-gray-50 flex flex-col overflow-y-auto">
      <Suspense>{!hideHeader && <Header />}</Suspense>
      <div className="flex-grow overflow-auto flex flex-col ">{children}</div>
      {!isStudentLanding && <Footer />}
    </div>
  );
}
