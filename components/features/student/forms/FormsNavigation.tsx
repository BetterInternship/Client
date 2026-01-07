"use client";

import { cn } from "@/lib/utils";
import { FileText, History, Edit } from "lucide-react";

export function FormsNavigation({
  activeView,
  onViewChange,
  currentFormName,
  currentFormLabel,
}: {
  activeView: "generate" | "history";
  onViewChange: (view: "generate" | "history") => void;
  currentFormName?: string | null;
  currentFormLabel?: string | null;
}) {
  const navItems = [
    {
      label: "My Forms",
      icon: History,
      view: "history" as const,
      isActive: activeView === "history" && !currentFormName,
      disabled: false,
    },
    {
      label: "Generate Forms",
      icon: FileText,
      view: "generate" as const,
      isActive: activeView === "generate" && !currentFormName,
      disabled: false,
    },
    ...(currentFormName
      ? [
          {
            label: currentFormLabel || currentFormName,
            icon: Edit,
            view: "form" as const,
            isActive: true,
            disabled: false,
          },
        ]
      : []),
  ];

  return (
    <div className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto">
        {/* Desktop Navigation */}
        <div className="hidden sm:flex gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() =>
                  !item.disabled &&
                  item.view !== "form" &&
                  onViewChange(item.view as "generate" | "history")
                }
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

        {/* Mobile Navigation */}
        <div className="sm:hidden flex gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() =>
                  !item.disabled &&
                  item.view !== "form" &&
                  onViewChange(item.view as "generate" | "history")
                }
                disabled={item.disabled}
                title={item.label}
                className={cn(
                  "flex items-center justify-center gap-2 px-3 py-2.5 font-medium text-sm transition-all duration-200 relative whitespace-nowrap flex-shrink-0",
                  item.disabled
                    ? "text-gray-400 cursor-not-allowed"
                    : item.isActive
                      ? "text-primary"
                      : "text-gray-600 hover:text-gray-900",
                )}
              >
                <Icon className="w-4 h-4" />
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
