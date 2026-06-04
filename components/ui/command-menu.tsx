import React from "react";
import { cn } from "@/lib/utils";

/**
 * A CommandMenu is a bar containing controls and other elements.
 * @param items (optional) Buttons and other elements to be stored in the CommandMenu.
 * @param className (optional) Custom styling.
 */
export const CommandMenu = ({
  items,
  className,
}: {
  items?: React.ReactNode[] | React.ReactNode[][];
  className?: string;
}) => {
  const groups =
    items && items.length > 0 && Array.isArray(items[0])
      ? (items as React.ReactNode[][])
      : [items as React.ReactNode[]];

  const renderGroup = (group: React.ReactNode[], idx: number) => {
    return (
      <React.Fragment key={idx}>
        {idx > 0 && <div className="h-6 w-px bg-gray-300 mx-1" />}
        {group.map((item, idx) =>
          typeof item === "string" ? (
            <span
              key={`text-${item}`}
              className="flex justify-center items-center text-gray-700 px-2"
            >
              {item}
            </span>
          ) : (
            <React.Fragment key={idx}>{item}</React.Fragment>
          )
        )}
      </React.Fragment>
    );
  };

  return (
    <div
      role="toolbar"
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "flex gap-4 px-6 py-2 w-full justify-center items-center text-xs bg-white border border-gray-200 transition bg-clip-border",
        className,
      )}
    >
      {groups.map((group, idx) => renderGroup(group || [], idx))}
    </div>
  );
};
