import { useEffect, useState, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import StatusBadge, {
  getStatusFilterKey,
  STATUS_COLOR_CLASSES,
  STATUS_HOVER_CLASSES,
} from "./status-badge";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

export type DropdownMenuItem = {
  id: string;
  onClick?: () => void;
};

export const DropdownMenu = ({
  className,
  items,
  defaultItem,
  enabled = true,
  placement = "bottom",
  placeholder,
}: {
  className?: string;
  items: DropdownMenuItem[];
  defaultItem: DropdownMenuItem;
  enabled?: boolean;
  placement?: "top" | "bottom";
  placeholder?: ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeItem, setActiveItem] = useState<DropdownMenuItem>(defaultItem);
  const [hasSelection, setHasSelection] = useState(!placeholder);
  const activeStatusClass = hasSelection
    ? STATUS_COLOR_CLASSES[getStatusFilterKey(parseInt(activeItem.id))]
    : "border-gray-300 bg-background text-gray-700";
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
  }>({ left: 0, width: 0 });

  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const updatePosition = () => {
      const r = menuRef.current?.getBoundingClientRect();
      if (!r) return;

      setPos(
        placement === "top"
          ? {
              bottom: window.innerHeight - r.top + 4,
              left: r.left,
              width: r.width,
            }
          : { top: r.bottom + 4, left: r.left, width: r.width },
      );
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, placement]);

  useEffect(() => {
    setActiveItem(defaultItem);
    setHasSelection(!placeholder);
  }, [defaultItem, placeholder]);

  useEffect(() => {
    const handleClickOut = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOut);

    return () => {
      document.removeEventListener("mousedown", handleClickOut);
    };
  }, []);

  return (
    <div
      ref={menuRef}
      aria-disabled={!enabled}
      className={cn(
        "relative inline-flex min-w-32 overflow-hidden rounded-[0.33em] border transition aria-disabled:cursor-not-allowed aria-disabled:pointer-events-none aria-disabled:opacity-50",
        activeStatusClass,
        className,
      )}
    >
      <div
        className="w-full"
        onClick={(e) => {
          e.stopPropagation();
          if (!enabled) return;
          setIsOpen((prev) => !prev);
        }}
      >
        <div className="flex w-full items-center justify-between gap-2 px-2.5 py-1.5">
          {hasSelection ? (
            <StatusBadge
              statusId={parseInt(activeItem.id)}
              className="h-auto border-0 bg-transparent p-0 text-inherit shadow-none hover:bg-transparent"
            />
          ) : (
            <span className="text-sm font-medium">{placeholder}</span>
          )}
          {isOpen ? (
            placement === "top" ? (
              <ChevronDown className="h-4 w-4 shrink-0 mt-0.5" />
            ) : (
              <ChevronUp className="h-4 w-4 shrink-0 mt-0.5" />
            )
          ) : placement === "top" ? (
            <ChevronUp className="h-4 w-4 shrink-0 mt-0.5" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 mt-0.5" />
          )}
        </div>
      </div>
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: placement === "top" ? 4 : -4 }}
              animate={{ opacity: 1, y: -0 }}
              exit={{ opacity: 0, y: placement === "top" ? 4 : -4 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{
                position: "fixed",
                top: pos.top,
                bottom: pos.bottom,
                left: pos.left,
                width: pos.width,
              }}
              className="z-[9999] min-w-max overflow-hidden rounded-[0.33em] border border-gray-200 bg-white p-1 shadow-lg space-y-2"
              onClick={(e) => e.stopPropagation()}
            >
              {items.map((item, idx) => {
                const itemFilterKey = getStatusFilterKey(parseInt(item.id));
                const itemStatusClass = STATUS_COLOR_CLASSES[itemFilterKey];
                const itemHoverClass = STATUS_HOVER_CLASSES[itemFilterKey];

                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex cursor-pointer gap-3 overflow-hidden rounded-[0.33em] border px-2.5 py-2 text-sm transition",
                      itemStatusClass,
                      itemHoverClass,
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveItem(item);
                      setHasSelection(true);
                      setIsOpen(false);
                      item.onClick?.();
                    }}
                  >
                    <StatusBadge
                      statusId={parseInt(item.id)}
                      className="h-auto border-0 bg-transparent p-0 text-inherit shadow-none hover:bg-transparent"
                    />
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
};
