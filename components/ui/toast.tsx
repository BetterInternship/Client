"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";

export type ToastAction =
  | { type: "button"; label: string; onClick: () => Promise<void> | void }
  | { type: "link"; label: string; href: string };

type Position = "bottom-right" | "bottom-left" | "top-right" | "top-left";

const posClass: Record<Position, string> = {
  "bottom-right": "bottom-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "top-right": "top-4 right-4",
  "top-left": "top-4 left-4",
};

export function Toast({
  visible,
  title,
  description,
  actions = [],
  position = "bottom-right",
  className,
  indicator = "ping-dot", // "none" | "ping-dot" | ReactNode
}: {
  visible: boolean;
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  actions?: ToastAction[];
  position?: Position;
  className?: string;
  /** "ping-dot" shows a blinking dot before the title. Pass ReactNode for a custom indicator. */
  indicator?: "none" | "ping-dot" | React.ReactNode;
}) {
  const [closing, setClosing] = useState(false);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed z-[60] max-w-sm",
        posClass[position],
        "transition-all duration-300",
        closing ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
      )}
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          "rounded-[0.33em] border border-primary/20 bg-white shadow-lg ring-1 ring-black/[0.03]",
          "p-4 pr-3 flex items-start gap-3 w-full",
          className
        )}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {indicator === "ping-dot" ? (
              <span className="relative inline-block h-4 w-4">
                <span className="absolute inset-0 rounded-full bg-primary/70 animate-ping" />
                <span className="absolute inset-0 rounded-full bg-primary" />
              </span>
            ) : indicator === "none" ? null : (
              indicator
            )}

            <p className="text-sm font-semibold text-gray-900">{title}</p>
          </div>

          {description ? (
            <p className="mt-1 text-sm text-gray-600 text-justify">{description}</p>
          ) : null}

          {actions.length > 0 ? (
            <div className="mt-3 flex items-center gap-2">
              {actions.map((a, i) =>
                a.type === "link" ? (
                  <Link
                    key={`link-${i}`}
                    href={a.href}
                    className="text-xs px-3 py-1.5 rounded-[0.33em] border border-primary/30 text-primary hover:bg-primary/5 transition"
                    onClick={() => setClosing(true)}
                  >
                    {a.label}
                  </Link>
                ) : (
                  <button
                    key={`btn-${i}`}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-[0.33em] border transition",
                      i === actions.length - 1
                        ? "ml-auto bg-primary text-white hover:opacity-90 border-transparent"
                        : "border-gray-200 hover:bg-gray-50"
                    )}
                    onClick={async () => {
                      setClosing(true);
                      await a.onClick();
                    }}
                  >
                    {a.label}
                  </button>
                )
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
