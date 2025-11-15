"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { Children, useEffect, useState } from "react";
import { Button } from "./button";

interface TabProps {
  name: string;
  children: React.ReactNode;
  indicator?: boolean; // show dot/badge on tab
  onTabChange?: () => void;
}
export const Tab = ({ name, children, indicator, onTabChange }: TabProps) => {
  return <>{children}</>;
};

interface TabGroupProps {
  children: React.ReactElement<TabProps>[];
  /** Controlled value (tab name). If provided, component becomes controlled. */
  value?: string;
  /** Change handler for controlled mode. */
  onValueChange?: (value: string) => void;
  /** Uncontrolled initial tab (defaults to first Tab child). */
  defaultValue?: string;
  /** If false, keep inactive tabs mounted (better UX for complex inputs). */
  unmountInactive?: boolean; // default: true
}
export const TabGroup = ({
  children,
  value,
  onValueChange,
  defaultValue,
  unmountInactive = true,
}: TabGroupProps) => {
  const names = Children.toArray(children).map(
    (c) => (c as React.ReactElement<TabProps>).props?.name ?? ""
  );
  const initial = defaultValue ?? (names[0] || "");
  const [internal, setInternal] = useState(initial);
  const activeTab = value ?? internal;

  useEffect(() => {
    // If uncontrolled and children change, ensure we have a valid initial tab
    if (value == null && !names.includes(internal)) {
      setInternal(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  const setActive = (v: string) => {
    if (value != null) onValueChange?.(v);
    else setInternal(v);
  };

  const handleTabChange = (name: string, onTabChange?: () => void) => {
    setActive(name);
    if (onTabChange){
      onTabChange();
    }
  };

  return (
    <>
      <div className="flex flex-row items-start gap-1 bg-white w-fit h-fit p-1 z-50 rounded-md border-2">
        {Children.map(children, (child) => {
          if (!React.isValidElement(child)) return null;
          const name = child.props?.name ?? "No name";
          const indicator = child.props?.indicator ?? false;
          const selected = activeTab === name;
          const onTabChange = child.props?.onTabChange;
          return (
            <Button
              key={name}
              variant="ghost"
              role="tab"
              aria-selected={selected}
              className="relative px-5 py-4 text-primary aria-selected:text-white aria-selected:bg-primary w-fit rounded-s"
              onClick={() => setActive(name)}
            >
              <span className="flex flex-row items-center text-xs gap-1">
                <span
                  className={cn(
                    "rounded-full w-2 h-2 bg-amber-500",
                    indicator ? "inline-block" : "hidden"
                  )}
                />
                {name}
              </span>
            </Button>
          );
        })}
      </div>

      <div className="relative w-full">
        {unmountInactive
          ? // render only active tab
            Children.toArray(children).find((child) => {
              const c = child as React.ReactElement<TabProps>;
              return React.isValidElement(c) && c.props?.name === activeTab;
            }) ?? null
          : // keep all mounted; hide inactive
            Children.map(children, (child) => {
              if (!React.isValidElement(child)) return null;
              const isActive = child.props?.name === activeTab;
              return (
                <div
                  key={child.props?.name}
                  role="tabpanel"
                  className={cn(isActive ? "block" : "hidden")}
                >
                  {child}
                </div>
              );
            })}
      </div>
    </>
  );
};
