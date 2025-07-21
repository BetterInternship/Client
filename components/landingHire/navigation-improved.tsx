"use client";

import { Button } from "@/components/ui/button";

export function Navigation() {
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
    </nav>
  );
}