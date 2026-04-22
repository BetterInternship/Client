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
  const hideSharedHeader =
    isStudentLanding ||
    pathname === "/companies/cebu-pacific" ||
    pathname === "/student/companies/cebu-pacific" ||
    pathname === "/companies/pcc" ||
    pathname === "/student/companies/pcc";

  return (
    <div className="h-[100svh] bg-gray-50 flex flex-col overflow-y-auto">
      <Suspense>{!hideSharedHeader && <Header />}</Suspense>
      <div className="flex-grow overflow-auto flex flex-col">{children}</div>
    </div>
  );
}
