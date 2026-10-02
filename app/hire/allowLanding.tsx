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
  const isListingCreationPage = pathname.endsWith("/listings/create");

  return (
    <>
      <Suspense>{!hideHeader && <HireAppHeader />}</Suspense>
      <div
        className={
          isListingCreationPage
            ? "flex flex-1 flex-col"
            : "flex min-h-0 grow flex-col"
        }
      >
        {children}
      </div>
      {!isStudentLanding && (
        <div className="hidden md:block">
          <Footer />
        </div>
      )}
    </>
  );
}
