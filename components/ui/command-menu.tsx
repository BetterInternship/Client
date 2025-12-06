import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ActionItem } from "./action-item";

/**
 * A CommandMenu is a bar containing controls and other elements.
 * @param items (optional) Buttons and other elements to be stored in the CommandMenu.
 * @param buttonLayout (optional) Buttons and other elements to be stored in the CommandMenu.
 * @param className (optional) Custom styling.
 */
export const CommandMenu = ({
  items,
  buttonLayout = "horizontal",
  className,
}: {
  // ActionItems are for buttons, but you can also put text.
  items?: Array<ActionItem | string> | Array<Array<ActionItem | string>>;
  buttonLayout?: "vertical" | "horizontal";
  className?: string;
}) => {
  const isActionItem = (x: any): x is ActionItem =>
    x &&
    typeof x === "object" &&
    typeof x.id === "string" &&
    typeof x.onClick === "function";

  const groups = (items && items.length > 0 && Array.isArray(items[0])) 
    ? (items as Array<Array<ActionItem | string>>) 
    : [items as Array<ActionItem | string>];

  const renderGroup = (group: Array<ActionItem | string>, idx: number) => {
    return (
      <React.Fragment key={idx}>
        {idx > 0 && (
          <div className="w-px bg-gray-300 my-1 mx-1" />
        )}
        {group.map((item, idx) => 
          isActionItem(item) ? (
            <button
              key={item.id}
              data-button-layout={buttonLayout}
              type="button"
              onClick={item.onClick}
              disabled={item.disabled}
              className={cn(
                "flex justify-center items-center rounded-sm gap-2 p-2",
                "data-[button-layout=vertical]:flex-col",
                item.destructive
                  ? "text-red-700 hover:bg-red-300/50 active:bg-red-400/75"
                  : "text-gray-700 hover:bg-gray-300/50 active:bg-gray-400/75",
                item.highlighted
                  ? item.highlightColor
                  : ""
              )}
            >
              {item.icon && <item.icon size={18} />}
              {item.label && <span>{item.label}</span>}
            </button>
          ) : (
            <span
              key={typeof item === "string" ? `text-${item}` : `node-${idx}`}
              className="flex justify-center items-center text-gray-700 px-2"
            >
              {item as React.ReactNode}
            </span>
          ),
        )}
      </React.Fragment>
    )
  };

  return (
    <div
      role="toolbar"
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "flex gap-4 px-6 py-2 justify-center items-stretch text-xs bg-white border border-gray-300 rounded-md transition",
        className,
      )}
    >
      {groups.map((group, idx) => renderGroup(group || [], idx))}
    </div>
  );
};
