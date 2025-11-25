import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, LucideIcon } from "lucide-react";
import { ActionItem } from "./action-item";
import StatusBadge from "./status-badge";

export const DropdownMenu = ({
  items,
  defaultItem,
  enabled = true,
} : {
  items: ActionItem[];
  defaultItem: ActionItem;
  enabled?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeItem, setActiveItem] = useState<ActionItem>(defaultItem);

  useEffect(() => {
    setActiveItem(defaultItem)
  }, [defaultItem]);

  return (
    <div
      aria-disabled={!enabled}
      className="
        relative border-2 border-gray-300 rounded-sm bg-white inline-flex w-max
      "
    >
      <div
        className="
          flex flex-col gap-1
        "
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
      >
        <div 
          className="flex gap-2 p-2 pr-4 rounded-sm items-center"
        >
          {isOpen
            ? <ChevronUp size={20} />
            : <ChevronDown size={20} />
          }
          <StatusBadge
            statusId={parseInt(activeItem.id)}
          />
        </div>
      </div>
      {isOpen && (
        <div
          className="
            absolute left-0 top-full mt-1 bg-white shadow-md z-10 w-full min-w-max rounded-sm border-gray-300 border-2
          "
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((item, idx) => {
            return (
              <div 
                key={idx}
                className="
                  flex gap-2 p-2 text-sm
                "
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveItem(item);
                  setIsOpen(false);
                  item.onClick?.();
                }}
              >
                {item.icon && <item.icon size={18} />}
                <span>
                  {item.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}