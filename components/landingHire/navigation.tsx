"use client";

import { UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function Navigation() {
  const router = useRouter();
  return (
    <nav className="fixed top-0 w-full z-50 bg-black/95 backdrop-blur-md border-b border-gray-800/50">
      <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <div className="text-3xl font-black text-white tracking-tighter">
              BetterInternship
            </div>
          </div>

          <div className="flex items-center space-x-6"></div>
        </div>
      </div>
      <div
        className="absolute flex flex-row text-white opacity-40 right-0 top-[50%] translate-y-[-50%] pr-12 hover:cursor-pointer"
        onClick={() => router.push("/login")}
      >
        <UserCircle className="w-8 h-8" />
      </div>
    </nav>
  );
}
