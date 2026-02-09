"use client";

import { cn } from "@/lib/utils";
import { FileText, History, Edit } from "lucide-react";

export function FormsNavigation({
  activeView,
  onViewChange,
  currentFormName,
  currentFormLabel,
  variant = "bar",
}: {
  activeView: "generate" | "history";
  onViewChange: (view: "generate" | "history") => void;
  currentFormName?: string | null;
  currentFormLabel?: string | null;
  variant?: "bar" | "inline";
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
    <>
      {variant === "bar" ? (
        <div className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
          <div className="px-5 mx-auto">
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
                      onViewChange(item.view)
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
                      onViewChange(item.view)
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
      ) : (
        <div className="flex gap-3 items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() =>
                  !item.disabled &&
                  item.view !== "form" &&
                  onViewChange(item.view)
                }
                disabled={item.disabled}
                title={item.label}
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-[0.33em] transition-all duration-200 flex-shrink-0",
                  item.disabled
                    ? "text-gray-400 cursor-not-allowed"
                    : item.isActive
                      ? "bg-primary/15 text-primary"
                      : "text-gray-600 hover:text-primary hover:bg-gray-100",
                )}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
