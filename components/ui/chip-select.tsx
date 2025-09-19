"use client";

import * as React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export type Option = { value: string; label: string };

/** Multiple selection chips: checkbox visual + stronger selected styles */
export function MultiChipSelect({
  value,
  onChange,
  options,
  className,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  options: Option[];
  className?: string;
}) {
  const hintId = React.useId();
  return (
    <ToggleGroup
      type="multiple"
      value={value}
      onValueChange={onChange}
      aria-multiselectable="true"
      aria-describedby={hintId}
      className={cn("flex flex-wrap gap-2", className)}
    >
      {/* SR-only helper: Multi-pick */}
      <span id={hintId} className="sr-only">
        Select one or more options.
      </span>

      {options.map((opt) => (
        <ToggleGroupItem
          key={opt.value}
          value={opt.value}
          aria-label={opt.label}
          className={cn(
            "group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs",
            "bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            "data-[state=on]:bg-primary/10 data-[state=on]:border-primary",
            "data-[state=on]:ring-2 data-[state=on]:ring-primary/30"
          )}
        >
          {/* Checkbox visual (square) */}
          <span
            aria-hidden
            className={cn(
              "inline-flex h-4 w-4 items-center justify-center rounded-[4px] border",
              "border-gray-400 bg-white",
              "group-data-[state=on]:bg-primary group-data-[state=on]:border-primary"
            )}
          >
            <Check className="h-3 w-3 opacity-0 text-primary-foreground group-data-[state=on]:opacity-100 transition-opacity" />
          </span>
          <span className="whitespace-nowrap">{opt.label}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

/** Single selection chips: radio visual (circle + filled dot) */
export function SingleChipSelect({
  value,
  onChange,
  options,
  className,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  options: Option[];
  className?: string;
}) {
  const hintId = React.useId();
  return (
    <ToggleGroup
      type="single"
      value={value ?? ""}
      onValueChange={(v) => onChange(v || null)}
      role="radiogroup"
      aria-describedby={hintId}
      className={cn("flex flex-wrap gap-2", className)}
    >
      {/* SR-only helper: Single-pick */}
      <span id={hintId} className="sr-only">
        Select exactly one option.
      </span>

      {options.map((opt) => (
        <ToggleGroupItem
          key={opt.value}
          value={opt.value}
          aria-label={opt.label}
          role="radio"
          className={cn(
            "group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs",
            "bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            "data-[state=on]:bg-primary/10 data-[state=on]:border-primary",
            "data-[state=on]:ring-2 data-[state=on]:ring-primary/30"
          )}
        >
          {/* Radio visual (circle with dot) */}
          <span
            aria-hidden
            className={cn(
              "inline-flex h-4 w-4 items-center justify-center rounded-full border-2",
              "border-gray-400 bg-white",
              "group-data-[state=on]:border-primary"
            )}
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full bg-primary scale-0 transition-transform",
                "group-data-[state=on]:scale-100"
              )}
            />
          </span>
          <span className="whitespace-nowrap">{opt.label}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
