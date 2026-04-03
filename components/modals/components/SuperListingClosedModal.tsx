"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Home } from "lucide-react";

type SuperListingClosedModalProps = {
  title?: string;
  description?: string;
  viewLabel?: string;
  leaveLabel?: string;
  onView: () => void;
  onLeave: () => void;
  accentColor?: string;
};

const DEFAULT_ACCENT_COLOR = "#72068c";

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace("#", "").trim();

  if (!/^[\da-fA-F]{3}$|^[\da-fA-F]{6}$/.test(normalized)) {
    return null;
  }

  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : normalized;

  const r = Number.parseInt(expanded.slice(0, 2), 16);
  const g = Number.parseInt(expanded.slice(2, 4), 16);
  const b = Number.parseInt(expanded.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export function SuperListingClosedModal({
  title = "Applications are now closed for this round.",
  description = "This application is closed, but your application will still be submitted. You can still explore the listing and challenge details.",
  viewLabel = "View listing",
  leaveLabel = "Back to search",
  onView,
  onLeave,
  accentColor = DEFAULT_ACCENT_COLOR,
}: SuperListingClosedModalProps) {
  const accentBorder = hexToRgba(accentColor, 0.22) ?? "rgba(114,6,140,0.22)";

  return (
    <div className="space-y-5 px-1 py-2 sm:space-y-6 sm:px-2">
      <div className="space-y-2 text-center">
        <h3 className="text-balance text-xl font-semibold leading-tight text-black sm:text-2xl">
          {title}
        </h3>
        <p className="text-sm leading-6 text-black/70 sm:text-[15px]">
          {description}
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          onClick={onLeave}
          className="h-11 rounded-[0.33em] bg-white transition-[background-color] hover:bg-black/[0.02]"
          style={{
            borderColor: accentBorder,
            color: accentColor,
          }}
        >
          <Home className="mr-2 h-4 w-4" />
          <span>{leaveLabel}</span>
        </Button>
        <Button
          type="button"
          onClick={onView}
          className="h-11 rounded-[0.33em] text-white transition-[filter] hover:brightness-95"
          style={{ backgroundColor: accentColor }}
        >
          <span>{viewLabel}</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
