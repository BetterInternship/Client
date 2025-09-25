"use client";

import * as React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import {
  Check,
  CheckIcon,
  CheckSquare,
  CheckSquare2,
} from "lucide-react";

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
            "group inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs h-7",
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
              "inline-flex h-3 w-3 items-center justify-center border",
              "border-gray-400 bg-white rounded-[2px]",
              "group-data-[state=on]:bg-primary group-data-[state=on]:border-primary"
            )}
          >
            <Check className="!h-2 !w-2 opacity-0 text-primary-foreground group-data-[state=on]:opacity-100 transition-opacity" />
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
            "group inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs h-7",
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
              "inline-flex h-3 w-3 items-center justify-center rounded-full border-2",
              "border-gray-400 bg-white",
              "group-data-[state=on]:border-primary"
            )}
          >
            <span
              className={cn(
                "h-[0.5em] w-[0.5em] rounded-full bg-primary scale-0 transition-transform",
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

/** Chip-like toggle. Works inside buttons, keyboard/ARIA friendly */
export function Chip({
  selected,
  onClick,
  children,
  className,
  showCheck = true,
  checkPosition = "start", // "start" | "end"
}: {
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  showCheck?: boolean;
  checkPosition?: "start" | "end";
}) {
  const Check = (
    <CheckSquare2
      aria-hidden="true"
      className={cn(
        "h-4 w-4 transition duration-150 ease-out",
        selected ? "opacity-100 scale-100" : "opacity-0 scale-75"
      )}
    />
  );

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition",
        "focus:outline-none focus:ring-2 focus:ring-offset-0",
        selected
          ? "border-primary/30 bg-primary/10 text-primary focus:ring-primary/30"
          : "border-gray-300 hover:border-gray-400 text-gray-700 focus:ring-gray-300",
        className
      )}
    >
      {showCheck && checkPosition === "start" ? Check : null}
      <span className="truncate">{children}</span>
      {showCheck && checkPosition === "end" ? Check : null}
    </button>
  );
}

