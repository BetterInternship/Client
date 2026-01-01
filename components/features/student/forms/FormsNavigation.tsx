"use client";

import { cn } from "@/lib/utils";
import { FileText, History } from "lucide-react";

export function FormsNavigation({
  activeView,
  onViewChange,
  hasHistory,
}: {
  activeView: "generate" | "history";
  onViewChange: (view: "generate" | "history") => void;
  hasHistory: boolean;
}) {
  const navItems = [
    {
      label: "Generate Forms",
      icon: FileText,
      view: "generate" as const,
      isActive: activeView === "generate",
    },
    {
      label: "Form History",
      icon: History,
      view: "history" as const,
      isActive: activeView === "history",
      disabled: !hasHistory,
    },
  ];

  return (
    <div className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.view}
                onClick={() => !item.disabled && onViewChange(item.view)}
                disabled={item.disabled}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all duration-200 relative",
                  item.disabled
                    ? "text-gray-400 cursor-not-allowed"
                    : item.isActive
                      ? "text-primary"
                      : "text-gray-600 hover:text-gray-900",
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.isActive && !item.disabled && (
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
