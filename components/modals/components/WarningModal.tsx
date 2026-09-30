"use client";

import { Button } from "@betterinternship/components";
export interface WarningModalProps {
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

export function WarningModal({
  message,
  primaryAction,
  secondaryAction,
  close,
}: WarningModalProps) {
  const handlePrimary = () => {
    primaryAction.onClick();
    close();
  };

  const handleSecondary = () => {
    secondaryAction?.onClick();
    close();
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-600 leading-relaxed text-left whitespace-pre-line">
        {message}
      </p>

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
