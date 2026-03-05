"use client";

import { cn } from "@/lib/utils";

export function FormSigningLayoutMobile({
  activeTab,
  onTabChange,
  stepLabel,
}: {
  activeTab: "step" | "preview";
  onTabChange: (tab: "step" | "preview") => void;
  stepLabel: string;
}) {
  return (
    <div className="grid grid-cols-2 border-b border-gray-300 bg-white">
      <button
        type="button"
        className={cn(
          "px-3 py-2 text-sm font-medium transition-colors",
          activeTab === "step" ? "bg-primary/10 text-primary" : "text-gray-600",
        )}
        onClick={() => onTabChange("step")}
      >
        Form: {stepLabel}
      </button>
      <button
        type="button"
        className={cn(
          "px-3 py-2 text-sm font-medium transition-colors",
          activeTab === "preview"
            ? "bg-primary/10 text-primary"
            : "text-gray-600",
        )}
        onClick={() => onTabChange("preview")}
      >
        Preview PDF
      </button>
    </div>
  );
}
