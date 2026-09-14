"use client";

import { Search } from "lucide-react";
import { cn } from "@betterinternship/components";
import { FormCheckbox } from "@/components/EditForm";

/**
 * The marketplace search field — a bordered pill with an optional inline
 * "For Credit" (MOA) toggle. Used by the desktop header and the mobile
 * search overlay.
 *
 * @component
 */
export const SearchInput = ({
  value,
  onChange,
  onEnter,
  placeholder = "Search listings",
  className = "",
  moaOnly,
  onToggleMoa,
  showForCredit = true,
}: {
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  placeholder?: string;
  className?: string;
  moaOnly: boolean;
  onToggleMoa: (v: boolean) => void;
  showForCredit?: boolean;
}) => {
  return (
    <div
      className={cn(
        "relative w-full border border-gray-300 rounded-[0.33em] overflow-hidden",
        "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40",
        "flex items-center",
        className,
      )}
    >
      <Search className="h-4 w-4 text-gray-400 pointer-events-none ml-3" />

      <input
        type="text"
        value={value}
        onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "flex-1 h-10 px-3",
          "bg-white border-0 outline-none focus:ring-0 text-gray-900 text-sm",
          "placeholder:text-gray-500",
        )}
      />

      {showForCredit && (
        <>
          <div className="h-6 w-0.5 bg-gray-300" />
          <FormCheckbox
            checked={moaOnly}
            setter={(v: boolean) => onToggleMoa(v)}
            className="flex items-center px-3 h-10 hover:bg-gray-50 transition-all"
            sentence={
              <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                For Credit
              </span>
            }
          />
        </>
      )}
    </div>
  );
};
