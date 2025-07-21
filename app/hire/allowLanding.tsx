"use client"

import { usePathname } from "next/navigation";
import Header from "@/components/features/student/header";
import { Footer } from "@/components/shared/footer";

export default function AllowLanding({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStudentLanding = pathname === "/";

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {!isStudentLanding && <Header />}
      <div className="flex-grow overflow-auto flex flex-col ">
        {children}
      </div>
      {!isStudentLanding && <Footer />}
    </div>
  );
}

