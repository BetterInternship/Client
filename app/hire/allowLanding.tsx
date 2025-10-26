"use client"

import { usePathname } from "next/navigation";
import Header from "@/components/features/hire/header";
import { Footer } from "@/components/shared/footer";
import { Suspense } from "react";

export default function AllowLanding({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStudentLanding = pathname === "/";

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <Suspense>{!isStudentLanding && <Header />}</Suspense>
      <div className="flex-grow overflow-auto flex flex-col ">
        {children}
      </div>
      {!isStudentLanding && <Footer />}
    </div>
  );
}

