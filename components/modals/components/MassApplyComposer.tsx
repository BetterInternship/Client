"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type MassApplyComposerProps = {
  initialText?: string;
  disabled?: boolean;
  minChars?: number; // optional validation
  maxChars?: number; // optional counter
  onCancel: () => void;
  onSubmit: (text: string) => void | Promise<void>;
  className?: string;
};

export function MassApplyComposer({
  initialText = "",
  disabled,
  minChars = 0,
  maxChars = 1500,
  onCancel,
  onSubmit,
  className,
}: MassApplyComposerProps) {
  const [text, setText] = useState(initialText);
  const [submitting, setSubmitting] = useState(false);

  const count = text.length;
  const tooShort = count < minChars;
  const tooLong = count > maxChars;

  const canSubmit = useMemo(
    () => !disabled && !submitting && !tooShort && !tooLong,
    [disabled, submitting, tooShort, tooLong]
  );

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      setSubmitting(true);
      await onSubmit(text.trim());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={cn("max-w-xl mx-auto space-y-4", className)}>
      <div className="space-y-1">
        <label className="text-sm font-medium">Cover letter (optional)</label>
        <textarea
          className={cn(
            "w-full min-h-[140px] rounded-[0.33em] border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40",
            tooLong && "border-red-400 focus:ring-red-300"
          )}
          placeholder="Write a short cover letter that will be sent to all selected jobs that require one…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={maxChars + 100}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {minChars > 0 ? `Minimum ${minChars} characters.` : "Optional"}
          </span>
          <span className={tooLong ? "text-red-500" : undefined}>
            {count}/{maxChars}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!canSubmit}>
          {submitting ? "Applying…" : "Apply to selected"}
        </Button>
      </div>
    </div>
  );
}
