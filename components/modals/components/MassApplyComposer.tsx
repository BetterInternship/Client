"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type MassApplyComposerProps = {
  disabled?: boolean;
  onCancel: () => void;
  onSubmit: () => void | Promise<void>;
  className?: string;
};

export function MassApplyComposer({
  disabled,
  onCancel,
  onSubmit,
  className,
}: MassApplyComposerProps) {
  const [submitting, setSubmitting] = useState(false);
  const canSubmit = !disabled && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      setSubmitting(true);
      await onSubmit();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={cn("max-w-xl mx-auto space-y-4", className)}>
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={() => void handleSubmit()} disabled={!canSubmit}>
          {submitting ? "Applying..." : "Apply to selected"}
        </Button>
      </div>
    </div>
  );
}
