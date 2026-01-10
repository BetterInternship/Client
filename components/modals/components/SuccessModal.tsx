"use client";

import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

export interface SuccessModalProps {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  message: string;
  primaryAction: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  close: () => void;
}

export function SuccessModal({
  icon: Icon,
  iconColor,
  title,
  message,
  primaryAction,
  secondaryAction,
  close,
}: SuccessModalProps) {
  const handlePrimary = () => {
    primaryAction.onClick();
    close();
  };

  const handleSecondary = () => {
    secondaryAction?.onClick();
    close();
  };

  return (
    <div className="space-y-3">
      {/* Icon - centered */}
      <div className="flex justify-center mb-1">
        <Icon className={`w-16 h-16 ${iconColor} flex-shrink-0`} />
      </div>

      {/* Title and Message */}
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-gray-900 text-center">
          {title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed text-justify">
          {message}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2 justify-end">
        {secondaryAction && (
          <Button
            onClick={handleSecondary}
            variant="outline"
            className="w-full sm:w-auto"
          >
            {secondaryAction.label}
          </Button>
        )}
        <Button onClick={handlePrimary} className="w-full sm:w-auto">
          {primaryAction.label}
        </Button>
      </div>
    </div>
  );
}
