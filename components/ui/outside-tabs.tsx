"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type OutsideTab = {
  key: string;
  label: string;
  indicator?: boolean; // optional dot (e.g., show errors)
};

export function OutsideTabs({
  tabs,
  value,
  onChange,
  children,
  className,
  tabsClassName,
  cardClassName,
}: {
  tabs: OutsideTab[];
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode; // put your conditional panels inside
  className?: string;
  tabsClassName?: string;
  cardClassName?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      {/* Tabs outside (above) */}
      <div className={cn("mb-1 flex flex-wrap gap-2", tabsClassName)}>
        {tabs.map((t) => {
          const active = value === t.key;
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium border rounded-t-xl shadow-sm transition-colors",
                active
                  ? "bg-background border-primary text-foreground"
                  : "bg-card border-border text-muted-foreground hover:bg-accent"
              )}
            >
              <span className="relative">
                {t.label}
                {t.indicator && (
                  <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-500 align-middle" />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Card below */}
      <Card className={cn("flex flex-col p-5", cardClassName)}>
        {children}
      </Card>
    </div>
  );
}

/** Simple helper to show a single active panel */
export function OutsideTabPanel({
  when,
  activeKey,
  children,
}: {
  when: string;
  activeKey: string;
  children: React.ReactNode;
}) {
  if (when !== activeKey) return null;
  return <>{children}</>;
}
