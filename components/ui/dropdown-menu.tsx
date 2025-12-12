import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, LucideIcon } from "lucide-react";
import { ActionItem } from "./action-item";
import StatusBadge from "./status-badge";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

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
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (!isOpen || !menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });

    const handleScroll = () => {
      const r = menuRef.current?.getBoundingClientRect();
      if (r) setPos({ top: r.bottom + 4, left: r.left, width: r.width });
    };
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isOpen]);

  useEffect(() => {
    setActiveItem(defaultItem)
  }, [defaultItem]);

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
      className="
        relative border border-gray-300 rounded-[0.33em] bg-white inline-flex w-max
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
          className="flex gap-2 px-2 py-1 pr-4 items-center"
        >
          {isOpen
            ? <ChevronUp size={cn(20)} />
            : <ChevronDown size={cn(20)} />
          }
          <StatusBadge
            statusId={parseInt(activeItem.id)}
          />
        </div>
      </div>
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: -0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.width }}
              className="bg-white shadow-lg z-[9999] min-w-max rounded-[0.33em] border-gray-300 border-2 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {items.map((item, idx) => {
                return (
                  <div 
                    key={idx}
                    className={cn(
                      "flex gap-2 p-2 text-sm hover:bg-primary/10 transition cursor-pointer overflow-hidden",
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveItem(item);
                      setIsOpen(false);
                      item.onClick?.();
                    }}
                  >
                    <StatusBadge
                      statusId={parseInt(item.id)}
                    />
                  </div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}