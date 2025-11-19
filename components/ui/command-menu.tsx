import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ActionItem } from "./action-item";

/**
 * Allow a CommandMenu to be docked to a side of the screen.
 */
type CommandMenuPositions = {
  position: "top" | "bottom" | "left" | "right";
};

/**
 * A CommandMenu is a bar containing controls and other elements.
 * @param items (optional) Buttons and other elements to be stored in the CommandMenu.
 * @param className (optional) Custom styling.
 * @param isVisible (optional) Control visibility of the CommandMenu.
 * @param defaultVisible (optional) Set initial visibility of the CommandMenu on page load. Defaults to false.
 * @param position (optional) Allow a CommandMenu to be docked to a specific side of the screen. Accepts 'top', 'bottom', 'left', or 'right'. If no position is given, the CommandMenu is undocked and can be positioned as you want.
 */
export const CommandMenu = ({
  items,
  className,
  isVisible,
  defaultVisible = false,
  position,
}: {
  // ActionItems are for buttons, but you can also put text.
  items?: Array<ActionItem | string>;
  className?: string;
  isVisible?: boolean;
  defaultVisible?: boolean;
  position?: CommandMenuPositions;
}) => {
  const [visible, setVisible] = useState<boolean>(defaultVisible);
  const controlled = typeof isVisible === "boolean";

  useEffect(() => {
    if (controlled) setVisible(isVisible);
  }, [isVisible, controlled]);

  const isActionItem = (x: any): x is ActionItem =>
    x &&
    typeof x === "object" &&
    typeof x.id === "string" &&
    typeof x.onClick === "function";

  if (!visible) return null;

  return (
    <div
      role="toolbar"
      aria-hidden={!visible}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "flex p-2 gap-2 justify-center items-stretch text-xs bg-white/75 backdrop-blur-md border-gray-300 z-[100]",
        position?.position
          ? [
              position.position === "left" || position?.position === "right"
                ? "flex-col inset-y-0 border-x-2"
                : "flex-row inset-x-0 border-y-2",
              position.position === "top" ? "fixed top-0" : "",
              position.position === "bottom" ? "fixed bottom-0" : "",
              position.position === "left" ? "fixed left-0" : "",
              position.position === "right" ? "fixed right-0" : "",
            ]
          : ["flex-row rounded-md border-2 gap-2 p-1 w-fit"],
        className,
      )}
    >
      {items?.map((item, idx) =>
        isActionItem(item) ? (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            disabled={item.disabled}
            className={cn(
              "flex justify-center items-center rounded-sm gap-2",
              item.destructive
                ? "text-red-700 hover:bg-red-300/50 active:bg-red-400/75"
                : "text-gray-700 hover:bg-gray-300/50 active:bg-gray-400/75",
              position?.position
                ? ["flex-col p-2"]
                : ["flex-row px-3 py-2"],
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
    </div>
  );
};
