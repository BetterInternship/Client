"use client";

import { AlertTriangle } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export function PendingVerificationBanner({
  isVerified,
}: {
  isVerified?: boolean;
}) {
  const { isMobile } = useMobile();

  if (isVerified !== false) return null;

  return (
    <div
      className={cn(
        "flex items-start gap-2 bg-yellow-50 border border-yellow-200  py-4",
        isMobile ? "px-3" : "px-12",
      )}
    >
      <div>
        <p className="flex flex-row font-bold tracking-tight text-2xl items-center text-yellow-800 mt-2">
          Your account is pending verification.
        </p>
        <p className="text-yellow-800 mb-2">
          Your listings won't be visible to students until you're verified. This
          usually takes a day.
        </p>
      </div>
    </div>
  );
}
