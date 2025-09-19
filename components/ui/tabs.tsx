"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { Children, useEffect, useState } from "react";
import { Button } from "./button";

/**
 * Represents a child of the TabGroup component.
 *
 * @component
 */
interface TabProps {
  name: string;
  children: React.ReactNode;
  indicator?: boolean;
}
export const Tab = ({ name, children, indicator }: TabProps) => {
  return <>{children}</>;
};

/**
 * Acts as a context for tabs.
 *
 * @component
 */
interface TabGroupProps {
  children: React.ReactElement<TabProps>[];
  onTabChange?: () => void;
}
export const TabGroup = ({ children, onTabChange }: TabGroupProps) => {
  const [activeTab, setActiveTab] = useState("");

  // Set the initial active tab to be the first element
  useEffect(() => {
    const firstChild = Children.toArray(
      children
    )[0] as React.ReactElement<TabProps>;
    if (React.isValidElement(firstChild))
      setActiveTab(firstChild.props?.name ?? "");
  }, []);

  const handleTabClick = () => {
    onTabChange?.();
  };

  // Create the selection
  return (
    <>
      <div className="sticky top-0 flex flex-row items-start bg-white w-full h-fit pb-0 z-50 border-b-2 border-b-gray-900">
        {Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            const name = child.props?.name ?? "No name";
            const indicator = child.props?.indicator ?? false;
            return (
              <Button
                variant="ghost"
                aria-selected={activeTab === name}
                className="relative px-5 py-4 text-gray-700 aria-selected:text-white aria-selected:bg-gray-900 w-fit rounded-t-[0.33em] rounded-b-none"
                onClick={() => setActiveTab(name)}
              >
                <span className="flex flex-row items-center text-xs gap-1">
                  <div
                    className={cn(
                      "rounded-full w-2 h-2 bg-warning",
                      indicator ? "block" : "hidden"
                    )}
                  ></div>
                  {name}
                </span>
              </Button>
            );
          }
        })}
      </div>
      <div className="relative w-full h-full">
        {
          Children.toArray(children).filter((child) => {
            const c = child as React.ReactElement<TabProps>;
            if (React.isValidElement(c)) return c.props?.name === activeTab;
          })[0]
        }
      </div>
    </>
  );
};
