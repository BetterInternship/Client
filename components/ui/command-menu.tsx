import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ActionItem } from "./action-item";

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
  undocked = true,
}: {
  // ActionItems are for buttons, but you can also put text.
  items?: Array<ActionItem | string> | Array<Array<ActionItem | string>>;
  className?: string;
  isVisible?: boolean;
  defaultVisible?: boolean;
  position?: "top" | "bottom" | "left" | "right";
  undocked?: boolean;
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
      data-position={position}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "flex gap-2 p-1 justify-center items-stretch text-xs bg-white/75 backdrop-blur-md border-gray-300 z-[100]",
        "data-[position=left]:flex-col \
         data-[position=left]:inset-y-0 \
         data-[position=left]:border-x-2",
        "data-[position=right]:flex-col \
         data-[position=right]:inset-y-0 \
         data-[position=right]:border-x-2",
        "data-[position=top]:fixed \
         data-[position=top]:top-0 \
         data-[position=top]:inset-x-0 \
         data-[position=top]:border-y-2",
        "data-[position=bottom]:fixed \
         data-[position=bottom]:bottom-0 \
         data-[position=bottom]:inset-x-0 \
         data-[position=bottom]:border-y-2",
        "data-[undocked=true]:rounded-md \
         data-[undocked=true]:border-2 \
         data-[undocked=true]:border-gray-300 \
         data-[undocked=true]:m-4 \
        ",
        undocked && (position === "top" || position === "bottom") && "!left-1/2 !-translate-x-1/2 !w-max",
        undocked && (position === "left" || position === "right") && "!top-1/2 !-translate-y-1/2 !h-max",
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
              position
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
