"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

// ------------ Types ------------
export type PickOption<T extends string = string> = {
  value: T;
  label: string;
  description?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

type SinglePickerBigProps<T extends string = string> = {
  label?: React.ReactNode;
  options: PickOption<T>[];
  value: T | null;
  onChange: (v: T | null) => void;
  className?: string;
  autoCollapse?: boolean;
  startCollapsed?: boolean;
};

// ------------ Component ------------
export function SinglePickerBig<T extends string = string>({
  label = "Select one",
  options,
  value,
  onChange,
  className,
  autoCollapse = true,
  startCollapsed = true,
}: SinglePickerBigProps<T>) {
  const [collapsed, setCollapsed] = React.useState(
    startCollapsed && value !== null
  );

  React.useEffect(() => {
    if (startCollapsed) setCollapsed(value !== null);
  }, [value, startCollapsed]);

  const selected = options.find((o) => o.value === value) || null;

  const handlePick = (v: T) => {
    onChange(v);
    if (autoCollapse) setCollapsed(true);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <div className="text-xs text-muted-foreground">{label}</div>}

      <AnimatePresence initial={false} mode="wait">
        {collapsed && selected ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between rounded-xl border bg-background px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                  {selected.icon ? (
                    <selected.icon className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  )}
                </span>
                <span className="text-sm font-medium">{selected.label}</span>
                {selected.description && (
                  <span className="text-xs text-muted-foreground">
                    — {selected.description}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                onClick={() => setCollapsed(false)}
              >
                Change <ChevronDown className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-3">
              {options.map((opt) => {
                const Icon = opt.icon;
                const active = value === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handlePick(opt.value)}
                    className={cn(
                      "relative rounded-2xl border px-4 py-3 text-left transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                      "hover:shadow-sm",
                      active
                        ? "border-primary/60 bg-primary/5"
                        : "border-border bg-card"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="text-base font-semibold leading-tight">
                          {opt.label}
                        </div>
                        {opt.description && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {opt.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
