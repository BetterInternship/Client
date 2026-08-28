"use client";

import * as React from "react";
import { cn } from "@betterinternship/components";

type HireOtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  onComplete?: (value: string) => void;
  className?: string;
};

export function HireOtpInput({
  value,
  onChange,
  length = 6,
  disabled,
  autoFocus,
  onComplete,
  className,
}: HireOtpInputProps) {
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);

  const digits = React.useMemo(() => {
    const values = value.replace(/\D/g, "").slice(0, length).split("");
    while (values.length < length) values.push("");
    return values;
  }, [value, length]);

  const focusIndex = (index: number) => {
    const input = refs.current[Math.max(0, Math.min(length - 1, index))];
    input?.focus();
    input?.select();
  };

  const commit = (next: string[]) => {
    const joined = next.join("").slice(0, length);
    onChange(joined);
    if (joined.length === length) onComplete?.(joined);
  };

  const handleChange = (index: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, "");
    const next = [...digits];
    if (!cleaned) {
      next[index] = "";
      commit(next);
      return;
    }

    let nextIndex = index;
    for (const char of cleaned) {
      if (nextIndex >= length) break;
      next[nextIndex] = char;
      nextIndex += 1;
    }
    commit(next);
    focusIndex(nextIndex);
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const next = [...digits];
      if (digits[index]) {
        next[index] = "";
        commit(next);
      } else if (index > 0) {
        next[index - 1] = "";
        commit(next);
        focusIndex(index - 1);
      }
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusIndex(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusIndex(index + 1);
    }
  };

  const handlePaste = (
    index: number,
    event: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    event.preventDefault();
    const text = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    if (!text) return;

    const next = [...digits];
    let nextIndex = index;
    for (const char of text) {
      if (nextIndex >= length) break;
      next[nextIndex] = char;
      nextIndex += 1;
    }
    commit(next);
    focusIndex(nextIndex);
  };

  return (
    <div className={cn("flex items-center justify-center gap-2 sm:gap-3", className)}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            refs.current[index] = element;
          }}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          onFocus={(event) => event.currentTarget.select()}
          aria-label={`Digit ${index + 1}`}
          className={cn(
            "bg-background text-foreground h-12 w-10 rounded-[0.33em] border border-gray-300 text-center text-lg font-semibold shadow-sm outline-none transition-colors sm:w-12",
            "focus:border-primary focus:ring-primary/30 focus:ring-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />
      ))}
    </div>
  );
}
