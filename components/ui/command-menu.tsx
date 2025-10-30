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
 * @param items Buttons and other elements to be stored in the CommandMenu.
 * @param className (optional) Custom styling.
 * @param isVisible Control visibility of the CommandMenu.
 * @param defaultVisible Set initial visibility of the CommandMenu on page load.
 * @param position Allow a CommandMenu to be docked to a specific side of the screen. Accepts 'top', 'bottom', 'left', or 'right'.
 */
export const CommandMenu = ({
  items,
  className,
  isVisible,
  defaultVisible = false,
  position,
}: {
  // ActionItems are for buttons, but you can also put text.
  items: Array<ActionItem | string>;
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
      className={cn(
        "flex p-2 gap-4 justify-center items-stretch bg-white/75 backdrop-blur-md border-gray-300 z-[100]",
        position?.position === "top" || position?.position === "bottom"
          ? "flex-row inset-x-0 border-y-2"
          : "flex-col inset-y-0 border-x-2",
        position?.position === "top" ? "fixed top-16" : "",
        position?.position === "bottom" ? "fixed bottom-0" : "",
        position?.position === "left" ? "fixed left-0" : "",
        position?.position === "right" ? "fixed right-0" : "",
        position?.position === null ? "rounded-sm" : "",
        className,
      )}
    >
      {items.map((item, idx) =>
        isActionItem(item) ? (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            disabled={item.disabled}
            className={cn(
              "flex flex-col justify-center items-center px-6 py-4 w-36 rounded-sm text-sm gap-2",
              item.destructive
                ? "text-red-700 hover:bg-red-300/50"
                : "hover:bg-gray-300/50 text-gray-700",
            )}
          >
            {item.icon && <item.icon size={20} />}
            <span>{item.label}</span>
          </button>
        ) : (
          <span
            key={typeof item === "string" ? `text-${item}` : `node-${idx}`}
            className="flex justify-center items-center text-sm text-gray-700"
          >
            {item as React.ReactNode}
          </span>
        ),
      )}
    </div>
  );
};
