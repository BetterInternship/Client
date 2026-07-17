"use client";

import { AlertTriangle } from "lucide-react";
import { Banner } from "@/components/ui/banner";

export function PendingVerificationBanner({
  isVerified,
}: {
  isVerified?: boolean;
}) {
  if (isVerified !== false) return null;

  return (
    <Banner className="mb-4">
      <div className="flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2 shrink-0" />
        <span>
          <span className="font-medium">
            Your account is pending verification.
          </span>{" "}
          Our team reviews every new employer account. Your listings won't be
          visible to students until you're verified. This usually takes a day.
        </span>
      </div>
    </Banner>
  );
}
