"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { FileText, History } from "lucide-react";

export function FormsNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const isGeneratePage =
    pathname.includes("/forms") && !pathname.includes("/history");
  const isHistoryPage = pathname.includes("/history");

  const navItems = [
    {
      label: "Generate Forms",
      icon: FileText,
      path: "/forms",
      isActive: isGeneratePage,
    },
    {
      label: "Form History",
      icon: History,
      path: "/forms/history",
      isActive: isHistoryPage,
    },
  ];

  return (
    <div className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
      <div className="container max-w-5xl mx-auto">
        <div className="flex gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all duration-200 relative",
                  item.isActive
                    ? "text-primary"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
