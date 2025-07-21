"use client";

import { Button } from "@/components/ui/button";

export function Navigation() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[rgba(15,15,15,1)] py-1 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-white tracking-tight">
              BetterInternship
            </div>
          </div>

          <div className="flex items-center space-x-4"></div>
        </div>
      </div>
    </nav>
  );
}
