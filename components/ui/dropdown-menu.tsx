import { useEffect, useState, useRef, type ReactNode } from "react";
import { cn } from "@betterinternship/components";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import StatusBadge, {
  getStatusFilterKey,
  STATUS_COLOR_CLASSES,
  STATUS_HOVER_CLASSES,
} from "./status-badge";
import { UI_STATUS_MAP } from "@/lib/consts/application";
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
  withDescriptions = false,
}: {
  className?: string;
  items: DropdownMenuItem[];
  defaultItem: DropdownMenuItem;
  enabled?: boolean;
  placement?: "top" | "bottom";
  placeholder?: ReactNode;
  withDescriptions?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeItem, setActiveItem] = useState<DropdownMenuItem>(defaultItem);
  const [hasSelection, setHasSelection] = useState(!placeholder);
  const activeStatusClass = hasSelection
    ? withDescriptions
      ? STATUS_DESCRIPTION_STYLES[getStatusFilterKey(parseInt(activeItem.id))]
          .trigger
      : STATUS_COLOR_CLASSES[getStatusFilterKey(parseInt(activeItem.id))]
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
              width: withDescriptions ? Math.max(r.width, 260) : r.width,
            }
          : {
              top: r.bottom + 4,
              left: r.left,
              width: withDescriptions ? Math.max(r.width, 260) : r.width,
            },
      );
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, placement, withDescriptions]);

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
          {hasSelection && withDescriptions ? (
            <StatusLabel
              statusId={parseInt(activeItem.id)}
              label={
                STATUS_DESCRIPTION_STYLES[
                  getStatusFilterKey(parseInt(activeItem.id))
                ].label
              }
            />
          ) : hasSelection ? (
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
              className={cn(
                "z-[9999] min-w-max overflow-hidden rounded-[0.33em] border border-gray-200 bg-white shadow-lg",
                withDescriptions ? "space-y-0 p-2" : "space-y-2 p-1",
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {items.map((item, idx) => {
                const itemFilterKey = getStatusFilterKey(parseInt(item.id));
                const itemStatusClass = withDescriptions
                  ? STATUS_DESCRIPTION_STYLES[itemFilterKey].item
                  : STATUS_COLOR_CLASSES[itemFilterKey];
                const itemHoverClass = withDescriptions
                  ? ""
                  : STATUS_HOVER_CLASSES[itemFilterKey];

                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex cursor-pointer gap-3 overflow-hidden rounded-[0.33em] px-2.5 py-2 text-sm transition",
                      withDescriptions ? "border-0" : "border",
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
                    {withDescriptions ? (
                      <>
                        <StatusLabel
                          statusId={parseInt(item.id)}
                          label={STATUS_DESCRIPTION_STYLES[itemFilterKey].label}
                          description={
                            STATUS_DESCRIPTION_STYLES[itemFilterKey].description
                          }
                        />
                        {item.id === activeItem.id && (
                          <Check className="ml-auto h-4 w-4 shrink-0 self-center" />
                        )}
                      </>
                    ) : (
                      <StatusBadge
                        statusId={parseInt(item.id)}
                        className="h-auto border-0 bg-transparent p-0 text-inherit shadow-none hover:bg-transparent"
                      />
                    )}
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

const STATUS_DESCRIPTION_STYLES: Record<
  string,
  { trigger: string; item: string; label: string; description: string }
> = {
  pending: {
    trigger: "border-warning bg-warning text-warning-foreground",
    item: "text-warning hover:bg-warning/10",
    label: "Pending",
    description: "Under review",
  },
  accepted: {
    trigger: "border-supportive bg-supportive text-supportive-foreground",
    item: "text-supportive hover:bg-supportive/10",
    label: "Accept",
    description: "Application approved",
  },
  rejected: {
    trigger: "border-destructive bg-destructive text-destructive-foreground",
    item: "text-destructive hover:bg-destructive/10",
    label: "Reject",
    description: "Not moving forward",
  },
  shortlisted: {
    trigger: "border-primary bg-primary text-primary-foreground",
    item: "text-primary hover:bg-primary/10",
    label: "Shortlist",
    description: "For further review",
  },
  archived: {
    trigger: "border-muted bg-muted text-muted-foreground",
    item: "text-muted-foreground hover:bg-muted",
    label: "Archive",
    description: "No longer active",
  },
  deleted: {
    trigger: "border-muted bg-muted text-muted-foreground",
    item: "text-muted-foreground hover:bg-muted",
    label: "Delete",
    description: "Removed application",
  },
  all: {
    trigger: "border-primary bg-primary text-primary-foreground",
    item: "text-primary hover:bg-primary/10",
    label: "All",
    description: "All applications",
  },
};

function StatusLabel({
  statusId,
  label,
  description,
}: {
  statusId: number;
  label: string;
  description?: string;
}) {
  const key = getStatusFilterKey(statusId);
  const status = UI_STATUS_MAP.get(key);
  if (!status) return null;

  return (
    <span className="flex min-w-0 items-start gap-2.5 text-left">
      <status.icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="min-w-0">
        <span className="block text-sm font-medium leading-5">{label}</span>
        {description && (
          <span className="block text-xs leading-4 text-slate-500">
            {description}
          </span>
        )}
      </span>
    </span>
  );
}
